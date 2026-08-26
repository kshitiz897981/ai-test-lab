import axios from "axios";

export const runTestCase = async (testCase, targetUrl) => {
    const startTime = Date.now();

    try {
        const { method, path, body, headers } = testCase.input;

        const response = await axios({
            method,
            url: `${targetUrl}${path}`,
            data: body,
            headers,
            validateStatus: () => true
        });

        const executionTime = Date.now() - startTime;

        return {
            status: response.status,
            body: response.data,
            executionTime
        };

    } catch (error) {

        const executionTime = Date.now() - startTime;

        return {
            status: null,
            body: null,
            error: error.message,
            executionTime
        };
    }
};