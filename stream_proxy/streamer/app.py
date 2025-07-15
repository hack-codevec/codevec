import asyncio
import json
from typing import Optional, Dict
import os
import redis.asyncio as redis
import jwt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_HOST =  os.getenv("REDIS_HOST", "localhost")
REDIS_PORT =  int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB =  0
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_JWT_ISSUER = os.getenv("SUPABASE_JWT_ISSUER", "")

active_connections: Dict[str, Dict[WebSocket, asyncio.Task]] = {}

async def get_redis_client():
    """Get a Redis client with automatic reconnection."""
    client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=REDIS_PASSWORD,
        socket_timeout=5,
        socket_keepalive=True,
        health_check_interval=30,
        retry_on_timeout=True,
        decode_responses=True
    )
    
    try:
        await client.ping()
        return client
    except Exception as e:
        print(f"Redis connection error: {e}")
        raise

async def get_token(websocket: WebSocket) -> Optional[Dict]:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
    try:
        # Decode the token
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except Exception as e:
        print(f"Auth exception: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None

@app.websocket("/socket/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):

    token_data = await get_token(websocket)
    if token_data is None:
        return
    
    await websocket.accept()
    print(f"Client connected to channel: {channel}")
    
    try:
        redis_client = await get_redis_client()
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")
        await websocket.send_json({
            "type": "error",
            "message": "Failed to connect to message server"
        })
        await websocket.close(1011)
        return
    
    # Create PubSub object with automatic health check
    pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
    
    # Setup connection tracking
    if channel not in active_connections:
        active_connections[channel] = {}
    
    listener_task = None
    
    try:
        # Subscribe to the channel with error handling
        try:
            await pubsub.subscribe(channel)
            print(f"Subscribed to Redis channel: {channel}")
            
            # Send test message to ensure everything is working
            await redis_client.publish(channel, json.dumps({
                "type": "system", 
                "message": "Connection established",
                "timestamp": asyncio.get_running_loop().time()
            }))
        except Exception as e:
            print(f"Failed to subscribe to channel {channel}: {e}")
            await websocket.send_json({
                "type": "error", 
                "message": f"Failed to subscribe to channel: {str(e)}"
            })
            await websocket.close(1011)
            return
        
        # Setup listener with reconnection logic
        listener_task = asyncio.create_task(
            pubsub_listener(websocket, pubsub, channel, redis_client)
        )
        active_connections[channel][websocket] = listener_task
        
        # Main connection loop - handle client messages
        while websocket.client_state == WebSocketState.CONNECTED:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                
                # Publish client message if needed
                try:
                    await redis_client.publish(channel, data)
                except Exception as e:
                    print(f"Failed to publish client message: {e}")
                    # Try to recreate Redis client if connection failed
                    redis_client = await get_redis_client()
            except asyncio.TimeoutError:
                # Just a receive timeout, not an error
                pass
            except WebSocketDisconnect:
                print(f"Client disconnected from {channel}")
                break
    
    except Exception as e:
        print(f"WebSocket error on channel {channel}: {e}")
    
    finally:
        # Clean up connections
        if channel in active_connections and websocket in active_connections[channel]:
            # Cancel the listener task if it exists
            if listener_task and not listener_task.done():
                listener_task.cancel()
            del active_connections[channel][websocket]
        
        # Unsubscribe and close Redis connection
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
            await redis_client.close()
            print(f"Cleaned up Redis connections for channel: {channel}")
        except Exception as e:
            print(f"Error closing Redis connections: {e}")
        
        # Close WebSocket if still open
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close()
        
        print(f"Connection to {channel} closed")

async def pubsub_listener(websocket, pubsub, channel, redis_client):
    """Listen for messages with automatic reconnection."""
    reconnect_delay = 1.0  # Start with 1 second delay, will increase on failures
    max_reconnect_delay = 30.0  # Maximum reconnect delay in seconds
    connection_healthy = True
    
    try:
        print(f"Starting listener for channel: {channel}")
        
        while websocket.client_state == WebSocketState.CONNECTED:
            try:
                if not connection_healthy:
                    # Attempt to reconnect
                    print(f"Attempting to reconnect to Redis for channel {channel}...")
                    try:
                        # Close old connection
                        await pubsub.close()
                        
                        # Create new connection
                        redis_client = await get_redis_client()
                        pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
                        await pubsub.subscribe(channel)
                        
                        connection_healthy = True
                        reconnect_delay = 1.0  # Reset delay after successful reconnection
                        print(f"Successfully reconnected to Redis for channel {channel}")
                    except Exception as e:
                        print(f"Failed to reconnect to Redis: {e}")
                        # Exponential backoff for reconnection attempts
                        await asyncio.sleep(reconnect_delay)
                        reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
                        continue
                
                # Get message with short timeout
                message = await pubsub.get_message(timeout=1.0)
                
                if message:
                    message_type = message.get("type")
                    
                    if message_type == "message":
                        data = message.get("data")
                        
                        # Forward message to WebSocket
                        try:
                            # Try to parse as JSON, fall back to string if needed
                            try:
                                payload = json.loads(data) if isinstance(data, str) else data
                                await websocket.send_json(payload)
                            except json.JSONDecodeError:
                                await websocket.send_text(str(data))
                        except Exception as e:
                            print(f"Error sending to WebSocket: {e}")
                
                # Prevent CPU spinning
                await asyncio.sleep(0.01)
            
            except redis.ConnectionError as e:
                print(f"Redis connection error in listener for {channel}: {e}")
                connection_healthy = False
                await asyncio.sleep(0.1)  # Small delay before reconnection attempt
            
            except Exception as e:
                print(f"Error in listener loop for {channel}: {e}")
                # For non-connection errors, add a small delay
                await asyncio.sleep(1)
    
    except asyncio.CancelledError:
        print(f"Listener for {channel} was cancelled")
    except Exception as e:
        print(f"Fatal error in listener for {channel}: {e}")