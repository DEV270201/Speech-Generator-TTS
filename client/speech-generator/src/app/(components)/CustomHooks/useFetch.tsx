import { useState, useCallback } from 'react';
import axios from 'axios';

interface GetOptions {
  url: string;
}

interface FetchResult {
  loading: boolean;
  get: (headers?: Record<string, string>) => Promise<any>;
}

export function useGet(options: GetOptions): FetchResult {
  const { url } = options;
  const [loading, setLoading] = useState<boolean>(false);

  const get = useCallback(async (headers?: Record<string, string>): Promise<any> => {
    setLoading(true);
    try {
      const response = await axios.get(url,
        {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      
      console.log("get response: ", response);
      return response.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err?.response?.data.detail || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { loading, get };
}