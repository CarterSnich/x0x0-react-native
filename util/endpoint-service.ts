import * as Application from "expo-application";
import {
  createUploadTask as cut,
  FileSystemNetworkTaskProgressCallback,
  FileSystemUploadResult,
  FileSystemUploadType,
  UploadProgressData,
} from "expo-file-system/legacy";

const URL_ENDPOINT = "https://0x0.st/";
const USER_AGENT = `x0x0/${Application.nativeApplicationVersion} (Android;RN Expo)`;

function createUploadTask(
  uri: string,
  secret: boolean = false,
  retention?: number,
  callback?: FileSystemNetworkTaskProgressCallback<UploadProgressData>
) {
  const parameters: Record<string, string> = {};
  if (secret) {
    parameters["secret"] = "";
  }
  if (retention) {
    parameters["expires"] = retention.toString();
  }

  return cut(
    URL_ENDPOINT,
    uri,
    {
      httpMethod: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "multipart/form-data",
      },
      uploadType: FileSystemUploadType.MULTIPART,
      fieldName: "file",
      parameters: parameters,
    },
    callback
  );
}

function handleUploadTask(result: undefined | null | FileSystemUploadResult) {
  if (result === null || result === undefined) {
    throw "Upload cancelled.";
  }

  const body = result.body.trim();

  if (result.status < 200 || result.status >= 300) {
    throw `Failed to upload. ${body}`;
  }

  const url = body;
  const token = result.headers["X-Token"] ?? "";
  const expires = result.headers["X-Expires"] ?? "";

  return { url, token, expires };
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

export { createUploadTask, destroy, handleUploadTask };
