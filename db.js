const { Pool } = require('pg');

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
};

const pool = new Pool(dbConfig);

async function checkUser(ctx) {
  const query = {
    text: 'SELECT * FROM participants WHERE telegram_id = $1',
    values: [ctx.from.id],
  };

  try {
    const res = await pool.query(query);
    if (res.rows.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function insertParticipant(telegram_id, grade) {
  const query = {
    text: 'INSERT INTO participants (telegram_id, grade) VALUES ($1, $2)',
    values: [telegram_id, grade],
  };
  return pool.query(query);
}

async function getParticipantId(telegram_id) {
  const query = {
    text: 'SELECT id FROM participants WHERE telegram_id = $1',
    values: [telegram_id],
  };
  return pool.query(query);
}

async function insertParticipantAnswers(participant_id, answers) {
  const query = {
    text: 'INSERT INTO participant_answers (participant_id, question_id, answer_id) VALUES ($1, $2, $3)',
    values: [participant_id, answers[0], answers[1]],
  };
  return pool.query(query);
}

module.exports = { checkUser, insertParticipant, getParticipantId, insertParticipantAnswers};