import { Stream } from "stream";

export class BodyService {
  public static getBody(data: any) {
    if (!data) {
      return undefined;
    }

    if (data instanceof Stream) {
        return "stream";
    }

    if (!(data instanceof String)) {
      return data;
    }

    try {
      return data ? JSON.parse(data as string) : data;
    } catch {
      return data;
    }
  }
}
