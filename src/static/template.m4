define(`RAW_PAGE', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="PipeScore is a modern, web-based bagpipe notation app."
    />
    <title>$1</title>
    <link rel="icon" href="/images/favicon.ico" />
    <link type="text/css" rel="stylesheet" href="base.css" />
    $2
    $3
  </head>
  <body>
    <header>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/scores">Get Started</a></li>
        <li><a href="/docs">Help</a></li>
        <li><a href="https://github.com/macarc/PipeScore">Source Code</a></li>
      </ul>
    </header>
    <main>$4</main>
  </body>
</html>
')dnl
define(`PAGE', `RAW_PAGE($1, `', `', $2)')dnl
define(`STYLED_PAGE', `RAW_PAGE($1, `<link type="text/css" rel="stylesheet" href="$2" />', `', $3)')dnl
define(`JS_PAGE', `RAW_PAGE($1, `', `<script src="$2"></script>', $3)')dnl
define(`STYLED_JS_PAGE', `RAW_PAGE($1, `<link type="text/css" rel="stylesheet" href="$2" />', `<script src="$3"></script>', $4)')dnl
