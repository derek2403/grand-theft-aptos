import axios from "axios";

export const getTwitterUserData = async (handle) => {
  try {
    const cleanHandle = handle.replace("@", "").trim().toLowerCase();

    // Get User Profile
    const profileUrl = `https://api.socialdata.tools/twitter/user/${cleanHandle}`;
    const profileResponse = await axios.get(profileUrl, {
      headers: {
        Authorization: `Bearer ${process.env.SOCIAL_DATA_TOOLS_API_KEY}`,
        Accept: "application/json",
      },
    });

    // Get User's Tweets
    const tweetsUrl = `https://api.socialdata.tools/twitter/search?query=from%3A${cleanHandle}&type=Latest`;
    const tweetsResponse = await axios.get(tweetsUrl, {
      headers: {
        Authorization: `Bearer ${process.env.SOCIAL_DATA_TOOLS_API_KEY}`,
        Accept: "application/json",
      },
    });

    const profile = profileResponse.data.data || profileResponse.data;
    const tweets = (
      tweetsResponse.data.data?.tweets ||
      tweetsResponse.data.tweets ||
      []
    ).map((tweet) => ({
      text: tweet.text || tweet.full_text,
      id: tweet.id,
    }));

    return {
      success: true,
      profile: profile,
      tweets: tweets,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: "Failed to fetch user data",
    };
  }
} 