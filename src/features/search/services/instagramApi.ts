"use client"

import { InstagramApiResponse } from '../types/search.types'

export class InstagramApiService {
  /**
   * 通常の投稿を取得する関数（25件まで）
   */
  static async fetchPosts(accountId: string, sortBy: string): Promise<InstagramApiResponse> {
    try {
      const url = `/api/instagram/search/posts?accountId=${accountId}&sortBy=${sortBy}&limit=25`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * すべての投稿を取得する関数
   */
  static async fetchAllPosts(accountId: string, sortBy: string): Promise<InstagramApiResponse> {
    try {
      const url = `/api/instagram/search/all-posts?accountId=${accountId}&sortBy=${sortBy}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
}