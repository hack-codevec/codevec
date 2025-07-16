'use client'

import { createClient } from "@/utils/supabase/client";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default apiClient;