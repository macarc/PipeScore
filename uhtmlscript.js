const updateScore = newScore => render(document.body, Score(newScore));

render(document.body, Score.render(Score.init(), { updateScore }));