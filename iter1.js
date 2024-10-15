import { expect } from "chai";
import axios from "axios";
import { execFile } from "child_process";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Iteration 1 Tests", function () {
    this.timeout(30000);

    let serverProcess;
    const serverAddress = "http://localhost:8080";

    before(function (done) {
        const serverPath = path.join(__dirname, "../app/server.js");
        serverProcess = execFile("node", [serverPath], err => {
            if (err) {
                console.error("Failed to start server:", err);
            }
        });

        const checkServer = () => {
            http.get(serverAddress, () => {
                done();
            }).on("error", () => {
                setTimeout(checkServer, 500);
            });
        };
        checkServer();
    });

    after(function (done) {
        serverProcess.kill();
        done();
    });

    describe("Test Handlers", function () {
        let originalURL;
        let shortenURL;

        it("should shorten the URL with POST /", async function () {
            originalURL = "https://practicum.yandex.ru/";
            const response = await axios.post(serverAddress + "/", originalURL, {
                headers: { "Content-Type": "text/plain" }
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
                await axios.get(shortenURL);
            } catch (error) {
                const response = error.response;
                expect(response.status).to.equal(307);
                expect(response.headers["Location"]).to.equal(originalURL);
            }
        });
    });
});
