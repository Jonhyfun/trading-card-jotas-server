import axios from "axios";

type UserType = "admin" | "global_mod" | "staff" | "";

type BroadcasterType = "affiliate" | "partner" | "";

type UserData = {
  id: string;
  login: string;
  display_name: string;
  type: UserType;
  broadcaster_type: BroadcasterType;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  email?: string;
  created_at: string; // UTC date and time in RFC3339 format
};

export const getTwitchUserData = async (twitchToken: string): Promise<UserData> => {
  let config = {
    method: 'GET',
    maxBodyLength: 2000,
    url: 'https://api.twitch.tv/helix/users',
    headers: {
      'Client-Id': 'fzrpx1kxpqk3cyklu4uhw9q0mpux2y',
      'Authorization': `Bearer ${twitchToken}`
    },
  };

  return axios.request(config).then(async ({ data: { data } }) => {
    return data[0]
  })
}