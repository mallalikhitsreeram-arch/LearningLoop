import aiTutorKnowledge from "./aiTutorKnowledge";

export function getTutorResponse(subject, question) {
  if (!subject || !question.trim()) {
    return "Please select a subject and enter your question.";
  }

  const subjectData = aiTutorKnowledge[subject.toLowerCase()];

  if (!subjectData) {
    return "Sorry, this subject is not available in the Learning Loops knowledge base yet.";
  }

  const userQuestion = question.toLowerCase();

  const matchedTopic = subjectData.find((item) =>
    item.keywords.some((keyword) =>
      userQuestion.includes(keyword.toLowerCase())
    )
  );

  if (!matchedTopic) {
    return "I couldn't find this topic in the selected subject's knowledge base. Please try asking about a topic that is currently available.";
  }

  return `
${matchedTopic.topic}

${matchedTopic.explanation}

Example:
${matchedTopic.example}

Key Points:
${matchedTopic.keyPoints.map((point) => `• ${point}`).join("\n")}

Practice Question:
${matchedTopic.practiceQuestion}
`;
}
