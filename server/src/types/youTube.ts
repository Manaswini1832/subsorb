//yt api returns this
export interface YouTubeChannelResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeChannel[];
}

//each channel from yt api
export interface YouTubeChannel {
  kind: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

//llm ai gen result
export interface AIData {
  summary: string;
  tags: string[];
}

//result of getYoutubeChannelDetails function
export interface YouTubeChannelDetailsResult {
  status: number;
  message: string;
  data: YouTubeChannelResponse | null;
  aiData: string | null;
  aiTags: string[] | null;
}
