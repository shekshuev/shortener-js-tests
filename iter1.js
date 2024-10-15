import { expect } from "chai";
import axios from "axios";

describe("Iteration 1 Tests", function () {
    this.timeout(30000);

    const serverAddress = "http://localhost:8080";
    const originalURL = "https://ya.ru/";
    let shortenURL;

    it("should shorten the URL with POST /", async function () {
        const response = await axios.post(serverAddress, {
            headers: { "Content-Type": "text/plain" },
            data: originalURL
        });

        expect(response.status).to.equal(201);
        shortenURL = response.data;

        try {
            new URL(shortenURL);
        } catch (err) {
            throw new Error(`Invalid shortened URL: ${shortenURL}`);
        }
    });

    it("should redirect to original URL with GET /{id}", async function () {
        try {
            await axios.get(shortenURL, {
                maxRedirects: 0
            });
        } catch (e) {
            expect(e.response.status).to.equal(307);
            expect(e.response.headers["location"]).to.equal(originalURL);
        }
    });
});
