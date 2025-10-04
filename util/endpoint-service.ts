const URL_ENDPOINT = "https://0x0.st/";
const USER_AGENT = "x0x0/0.0.1 (Android;RN Expo)";

async function upload(
  name: string,
  type: string,
  uri: string,
  secret: boolean = false,
  retention?: number
) {
  const formData = new FormData();
  const formFile = { name, type, uri };
  formData.append("file", formFile as any);
  if (secret) {
    formData.append("secret", "");
  }
  if (retention !== undefined) {
    formData.append("expires", retention.toString());
  }

  const response = await fetch(URL_ENDPOINT, {
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    body: formData,
  });
  const responseText = (await response.text()).trim();

  if (!response.ok) {
    throw `Upload failed: ${response.status} - ${responseText}`;
  }

  const token = response.headers.get("x-token");
  const expires = response.headers.get("x-expires") ?? "";

  if (token === null) {
    throw `File already exist remotely: ${responseText}`;
  }

  return {
    url: responseText,
    token,
    expires,
  };
}

async function destroy(url: string, token: string) {
  const body = new FormData();
  body.append("token", token);
  body.append("delete", "");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    method: "POST",
    body: body,
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw `Error ${response.status}: ${responseText}`;
  }

  return responseText;
}

export { destroy, upload };
