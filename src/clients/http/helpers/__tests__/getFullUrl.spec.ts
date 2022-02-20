import { getFullUrl } from "../getFullUrl";

describe("concatUlr", () => {
  const args = [
    ["http://test.com/temp", "/api/call"],
    ["http://test.com/temp", "api/call"],
    ["http://test.com/temp/", "/api/call"],
    ["http://test.com/temp/", "/api/call/"],
    ["http://test.com", "temp/api/call/"],
  ];

  it.each(args)(`should return full url from %s and %s`, (baseUrl: string, url: string) => {
    const result = getFullUrl(baseUrl, url);

    expect(result).toEqual('http://test.com/temp/api/call');
  });

  it("should return full url with params", () => {
    const baseUrl = "http://test.com/temp";
    const url = "/api/call?param1=1&param2=http://test.com/result"

    const result = getFullUrl(baseUrl, url);

    expect(result).toEqual("http://test.com/temp/api/call?param1=1&param2=http://test.com/result");
  });

  it("should throw an error", () => {
    expect(() => getFullUrl("", "http://test.com/temp/api/call")).toThrowError();
  });
});
