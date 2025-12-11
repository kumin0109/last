const fetch = require("node-fetch");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { studentName, question, answer, isCorrect } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USERNAME = "kumin0109";
    const REPO_NAME = "ai-agent-knowledge";

    const DID_API_KEY = process.env.DID_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;
    const KNOWLEDGE_ID = process.env.KNOWLEDGE_ID;

    const timestamp = new Date().toISOString();

    const content = `
학생: ${studentName}
문제: ${question}
답변: ${answer}
정답 여부: ${isCorrect}
시간: ${timestamp}
`.trim();

    const fileName = `quiz_${studentName}_${Date.now()}.txt`;
    const contentBase64 = Buffer.from(content).toString("base64");

    // 1) GitHub 업로드
    await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${fileName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add quiz answer from ${studentName}`,
          content: contentBase64,
        }),
      }
    );

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${fileName}`;

    // 2) D-ID Knowledge 문서 등록
    const didHeaders = {
      "x-client-key": DID_API_KEY,
      "Content-Type": "application/json",
    };

    const documentRes = await fetch(
      `https://api.d-id.com/knowledge/${KNOWLEDGE_ID}/documents`,
      {
        method: "POST",
        headers: didHeaders,
        body: JSON.stringify({
          documentType: "text",
          source_url: rawUrl,
          title: `${studentName}의 퀴즈 답변`,
        }),
      }
    );

    const docJson = await documentRes.json();

    // 3) Agent에 Knowledge 연결 (필수)
    await fetch(`https://api.d-id.com/agents/${AGENT_ID}`, {
      method: "PATCH",
      headers: didHeaders,
      body: JSON.stringify({
        knowledge: { id: KNOWLEDGE_ID },
      }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        github_url: rawUrl,
        did_document: docJson,
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
};
