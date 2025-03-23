const mailTemplates = {
  forgotPassword: (data) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #d9534f;
            text-align: center;
            background: #f8d7da;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
            text-align: center;
        }
        .highlight {
            color: #d9534f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Here's your password reset code:</p>
        <div class="code">${data.token}</div>
        <p><strong>This code will expire in 1 hour.</strong></p>
        <p>Please note:</p>
        <ul>
            <li>If you didn't request this password reset, please ignore this email.</li>
            <li>For security reasons, <span class="highlight">do not share this code</span> with anyone.</li>
            <li>The code is case-sensitive.</li>
        </ul>
        <p>Need help?</p>
        <p>If you have any questions or concerns, please contact our support team.</p>
        <p>Best regards,</p>
        <p><strong>Your Learning Platform Team</strong></p>
        <div class="footer">
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;
  },
  achievementUnlocked: (data) => {
    return `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Achievement Unlocked!</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
          }
          h1 {
              color: #111;
              font-size: 28px;
              margin: 0;
              font-weight: 800;
          }
          .subheading {
              color: #555;
              font-size: 16px;
              margin-top: 5px;
          }
          .achievement-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
              border: 1px solid #e0e0e0;
              position: relative;
              overflow: hidden;
          }
          .badge {
              font-size: 50px;
              margin: 0 auto 20px;
              line-height: 1;
          }
          .achievement-name {
              font-size: 24px;
              font-weight: 700;
              color: #111;
              margin: 0 0 5px;
          }
          .achievement-desc {
              color: #555;
              font-size: 16px;
              margin: 0 0 20px;
              line-height: 1.5;
          }
          .xp-badge {
              background: #000;
              color: #fff;
              font-weight: 700;
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              font-size: 18px;
          }
          .stats {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 15px;
              margin: 25px 0;
          }
          .stats-row {
              display: flex;
              justify-content: space-around;
              flex-wrap: wrap;
          }
          .stat {
              padding: 10px;
              flex: 1;
              min-width: 120px;
          }
          .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #111;
              margin: 0;
          }
          .stat-label {
              font-size: 14px;
              color: #777;
              margin: 0;
          }
          .cta-button {
              display: block;
              background: #000;
              color: #fff;
              text-decoration: none;
              padding: 14px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 30px auto 15px;
              text-align: center;
              width: 80%;
              transition: all 0.3s ease;
          }
          .cta-button:hover {
              background: #333;
          }
          .share-section {
              text-align: center;
              margin: 25px 0 15px;
          }
          .share-title {
              font-weight: 600;
              margin-bottom: 10px;
              font-size: 16px;
          }
          .social-icons {
              display: flex;
              justify-content: center;
              gap: 15px;
              margin-top: 10px;
          }
          .social-icon {
              width: 40px;
              height: 40px;
              background: #f1f1f1;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-decoration: none;
              font-size: 20px;
          }
          .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 13px;
          }
          .footer p {
              margin: 5px 0;
          }
          .footer a {
              color: #555;
              text-decoration: none;
          }
          .highlight {
              color: #000;
              font-weight: 600;
          }
          .date {
              color: #999;
              font-size: 14px;
              text-align: right;
              margin-bottom: 20px;
          }
          @media (max-width: 600px) {
              .container {
                  margin: 10px;
                  padding: 20px;
              }
              .cta-button {
                  width: 100%;
              }
              .stats-row {
                  flex-direction: column;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="date">${data.currentDate || "March 23, 2025"}</div>
          <div class="header">
              <h1>Achievement Unlocked! 🎯</h1>
              <p class="subheading">Congratulations on your latest accomplishment!</p>
          </div>
          
          <p>Hello ${data.userName},</p>
          
          <p>Great job! You've just unlocked a new achievement on your learning journey. Keep up the momentum!</p>
          
          <div class="achievement-card">
              <div class="badge">
                  🏆
              </div>
              <h2 class="achievement-name">${data.achievementName}</h2>
              <p class="achievement-desc">${data.achievementDescription}</p>
              <div class="xp-badge">+${data.xpEarned} XP</div>
          </div>
          
          <div class="stats">
              <div class="stats-row">
                  <div class="stat">
                      <p class="stat-value">${data.totalAchievements}</p>
                      <p class="stat-label">Total Achievements</p>
                  </div>
                  <div class="stat">
                      <p class="stat-value">${data.currentXP}</p>
                      <p class="stat-label">Current XP</p>
                  </div>
              </div>
          </div>
          
          <p>Each achievement brings you closer to mastery. What will you tackle next?</p>
          
          <a href="${data.platformUrl}" class="cta-button">Continue Your Journey</a>
          
          <div class="share-section">
              <p class="share-title">Share your achievement with friends:</p>
              <div class="social-icons">
                  <a href="https://twitter.com/intent/tweet?text=I just unlocked the ${data.achievementName} achievement on Inspiron25! Join me in learning: https://inspiron25.com" class="social-icon">
                      🐦
                  </a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=https://inspiron25.com" class="social-icon">
                      📘
                  </a>
                  <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://inspiron25.com" class="social-icon">
                      💼
                  </a>
              </div>
          </div>
          
          <div class="footer">
              <p>Keep learning and achieving!</p>
              <p>The <span class="highlight">Inspiron25 Team</span></p>
              <p><a href="#">Unsubscribe</a> | <a href="#">View in browser</a> | <a href="#">Privacy Policy</a></p>
          </div>
      </div>
  </body>
  </html>`;
  },
  levelUp: (data) => {
    return `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Level Up!</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #f1f1f1;
              margin-bottom: 30px;
          }
          h1 {
              color: #111;
              font-size: 32px;
              margin: 0;
              font-weight: 800;
          }
          .subtitle {
              color: #555;
              font-size: 16px;
              margin: 5px 0 0;
          }
          .level-banner {
              background: linear-gradient(135deg, #000 0%, #333 100%);
              color: white;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 25px 0;
              position: relative;
              overflow: hidden;
          }
          .level-emoji {
              font-size: 72px;
              margin: 0;
              line-height: 1;
          }
          .level-number {
              font-size: 72px;
              font-weight: 900;
              margin: 0;
              line-height: 1;
              background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
          }
          .level-title {
              font-size: 28px;
              font-weight: 700;
              margin: 10px 0 0;
              text-transform: uppercase;
              letter-spacing: 1px;
          }
          .stats-cards {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
              gap: 15px;
              flex-wrap: wrap;
          }
          .stat-card {
              flex: 1;
              min-width: 130px;
              background: #f8f9fa;
              border-radius: 10px;
              padding: 15px;
              text-align: center;
              border: 1px solid #eee;
              transition: transform 0.3s ease;
              margin-bottom: 10px;
          }
          .stat-card:hover {
              transform: translateY(-5px);
          }
          .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #111;
              margin: 0 0 5px;
          }
          .stat-label {
              font-size: 14px;
              color: #777;
              margin: 0;
          }
          .xp-progress {
              margin: 25px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 10px;
          }
          .progress-title {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              margin-bottom: 10px;
              font-weight: 600;
          }
          .progress-text {
              font-size: 14px;
              color: #555;
              margin-bottom: 5px;
          }
          .next-level {
              color: #000;
          }
          .progress-bar-bg {
              height: 12px;
              background: #e9ecef;
              border-radius: 6px;
              overflow: hidden;
              position: relative;
          }
          .progress-bar {
              height: 100%;
              background: linear-gradient(90deg, #000000 0%, #333333 100%);
              border-radius: 6px;
              width: ${data.percentToNextLevel}%;
              transition: width 1s ease-in-out;
          }
          .cta-button {
              display: block;
              background: #000;
              color: #fff;
              text-decoration: none;
              padding: 16px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 30px auto 15px;
              text-align: center;
              width: 80%;
              transition: all 0.3s ease;
          }
          .cta-button:hover {
              background: #333;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .quote {
              font-style: italic;
              text-align: center;
              color: #666;
              margin: 30px 0;
              padding: 0 30px;
              line-height: 1.6;
          }
          .footer {
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 13px;
          }
          .footer p {
              margin: 5px 0;
          }
          .footer a {
              color: #555;
              text-decoration: none;
          }
          .highlight {
              color: #000;
              font-weight: 600;
          }
          .date {
              color: #999;
              font-size: 14px;
              text-align: right;
              margin-bottom: 20px;
          }
          @media (max-width: 600px) {
              .container {
                  margin: 10px;
                  padding: 20px;
              }
              .cta-button {
                  width: 100%;
              }
              .stats-cards {
                  flex-direction: column;
              }
              .progress-title {
                  flex-direction: column;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="date">${data.currentDate || "March 23, 2025"}</div>
          <div class="header">
              <h1>LEVEL UP! 🚀</h1>
              <p class="subtitle">Your dedication has paid off!</p>
          </div>
          
          <p>Hello ${data.userName},</p>
          
          <p>Congratulations! Your consistent effort and thirst for knowledge have propelled you to a new level on our platform. This is a significant milestone in your learning journey!</p>
          
          <div class="level-banner">
              <div class="level-emoji">⭐</div>
              <p class="level-number">${data.newLevel}</p>
              <h2 class="level-title">${data.levelName}</h2>
          </div>
          
          <p>Your commitment to learning is impressive. You've now reached <span class="highlight">Level ${data.newLevel}: ${data.levelName}</span>, placing you among our dedicated learners.</p>
          
          <div class="stats-cards">
              <div class="stat-card">
                  <p class="stat-value">${data.completedRoadmaps}</p>
                  <p class="stat-label">Roadmaps Completed</p>
              </div>
              <div class="stat-card">
                  <p class="stat-value">${data.quizzesCompleted}</p>
                  <p class="stat-label">Quizzes Mastered</p>
              </div>
              <div class="stat-card">
                  <p class="stat-value">${data.totalXP}</p>
                  <p class="stat-label">Total XP</p>
              </div>
          </div>
          
          <div class="xp-progress">
              <div class="progress-title">
                  <span class="progress-text">Progress to Level ${data.newLevel + 1}${": "}</span>
                  <span class="progress-text">${data.currentXP} / ${data.xpNeededForNextLevel} XP</span>
              </div>
              <div class="progress-bar-bg">
                  <div class="progress-bar"></div>
              </div>
          </div>
          
          <p class="quote">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice." — Brian Herbert</p>
          
          <a href="${data.platformUrl}" class="cta-button">Explore Your New Level</a>
          
          <p>Continue your learning journey and discover all the new features and content available to you at Level ${data.newLevel}. New challenges and opportunities await!</p>
          
          <div class="footer">
              <p>Keep growing and reaching new heights!</p>
              <p>The <span class="highlight">Inspiron25 Team</span></p>
              <p><a href="#">Unsubscribe</a> | <a href="#">View in browser</a> | <a href="#">Privacy Policy</a></p>
          </div>
      </div>
  </body>
  </html>`;
  }
};

module.exports = mailTemplates;
