include(`template.m4')dnl
STYLED_JS_PAGE(`Scores - PipeScore (DEV)', `scores.css', `dist/Scores/scores.js',
``<h1>Your Scores</h1>
  <div id="buttons">
    <button id="sign-out">Sign Out</button>
    <a href="/docs" id="help-page">Help page</a>
    <button id="new-score">New Score</button>
  </div>
  <section id="scores"></section>
'')dnl
