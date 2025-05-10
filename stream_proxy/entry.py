import multiprocessing as mp
mp.set_start_method('spawn', force=True)

from tasks.worker import app

if __name__ == '__main__':
    app.worker_main(argv=['worker', '--loglevel=info', '--concurrency=1'])
