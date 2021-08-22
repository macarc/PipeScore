include(`template.m4')dnl
STYLED_JS_PAGE(`Log in to PipeScore', `login.css', `dist/Login/login.js',
``<h1>Log in</h1>
<form id="login">
  <label>Email: <input type="email" placeholder="someone@example.com" /></label>
  <label>Password: <input type="password" /></label>
  <input type="submit" value="Log In" />
</form>
<hr />
<h1>or Sign up</h1>
<p>Signing up is completely free.</p>
<form id="signup">
  <label>Email: <input type="email" placeholder="someone@example.com" /></label>
  <label>Password: <input type="password" id="first-pwd" /></label>
  <label>Password (again): <input type="password" id="second-pwd" /></label>
  <input type="submit" value="Sign Up" />
</form>
<hr />
<h1>or don&#39;t!</h1>
<p>
  You can use PipeScore without logging in and get full functionality, except
  that your scores cannot be saved. This is ideal for testing out PipeScore.
</p>
<a href="/pipescore"><button>Use without an account</button></a>'')dnl
