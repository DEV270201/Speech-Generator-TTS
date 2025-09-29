import { useState, useCallback } from 'react';
import axios from 'axios';

interface PostOptions {
  url: string;
}

interface PostResult {
  loading: boolean;
  post: (body: any, headers?: Record<string, string>) => Promise<any>;
}

export function usePost(options: PostOptions): PostResult {
  const { url } = options;
  const [loading, setLoading] = useState<boolean>(false);

  const post = useCallback(async (body: any, headers?: Record<string, string>): Promise<any> => {
    setLoading(true);
    try {
      const response = await axios.post(url,
        body,
        {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      
      console.log("response: ", response);
      return response.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err?.response?.data.detail || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { loading, post };
}