function customTag(tagName, fn) {
  document.createElement(tagName);
  //find all the tags occurrences (instances) in the document
  var tagInstances = document.getElementsByTagName(tagName);
        //for each occurrence run the associated function
        for ( var i = 0; i < tagInstances.length; i++) {
            fn(tagInstances[i]);
        }
}

function linePuzzle(element) {
	if (element.attributes.puzzle) {
		var puzzle = element.attributes.puzzle.value;
		
		element.innerHTML = "<p>Hi!</p>";
	}
}

customTag("line-puzzle",linePuzzle);

window.alert("AAAAAAAAAAA");