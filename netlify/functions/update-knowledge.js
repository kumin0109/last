const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const DID_API_KEY = process.env.DID_API_KEY;
  const KNOWLEDGE_ID = process.env.KNOWLEDGE_ID;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = "sdkparkforbi";
  const REPO_NAME = "ai-agent-knowledge";

  const { studentName, question, answer, isCorrect } = JSON.parse(event.body);
  const timestamp = new Date().toLocaleString('ko-KR');
  
  const knowledgeContent = `
지식제목: 퀴즈 답변 기록 - ${studentName}
답변일시: ${timestamp}
답변자: ${studentName}
문제: ${question}
선택한 답: ${answer}
정답 여부: ${isCorrect ? '정답' : '오답'}
해설:
이중과제 운동은 일상생활에서 걷기와 대화하기, 걷기와 물건 들기 등 
여러 과제를 동시에 처리해야 하는 상황에 대비하는 훈련입니다. 
스텝레더 운동에 청각 자극(호각 소리)을 추가하여 
주의력, 기억력, 반응속도를 함께 향상시킬 수 있습니다.
  `.trim();

  const fileName = `quiz_${studentName}_${Date.now()}.txt`;
  const fileContentBase64 = Buffer.from(knowledgeContent, 'utf-8').toString('base64');

  const githubResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${fileName}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add quiz answer from ${studentName}`,
        content: fileContentBase64
      })
    }
  );

  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${fileName}`;

  const documentData = {
    documentType: 'text',
    source_url: rawUrl,
    title: `${studentName}_답변_${Date.now()}`
  };

  const addDocumentResponse = await fetch(
    `https://api.d-id.com/knowledge/${KNOWLEDGE_ID}/documents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentData)
    }
  );

  const document = await addDocumentResponse.json();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: '답변이 성공적으로 저장되었습니다',
      documentId: document.id,
      githubUrl: rawUrl
    })
  };
};
