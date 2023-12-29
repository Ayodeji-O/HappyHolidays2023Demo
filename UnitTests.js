function UnitTestInterface() {
	this.testCollection = [
		[ "Resource catalog parsing",														TestResourceCatalogParsing						    ],
		[ "Collision edge determination (empty)",											TestEmptyCollisionEdgeInfoDetermination				],
		[ "Collision edge determination (top)",												TestTopCollisionEdgeInfoDetermination				],
		[ "Collision edge determination (bottom)",											TestBottomCollisionEdgeInfoDetermination			],
		[ "Collision edge determination (left)",											TestLeftCollisionEdgeInfoDetermination				],
		[ "Collision edge determination (right)",											TestRightCollisionEdgeInfoDetermination				],
		[ "Collision with immovable object (left edge)", 									TestLeftEdgeWithImmovableCollisionEvaluation		],
		[ "Collision with immovable object (right edge)", 									TestRightEdgeWithImmovableCollisionEvaluation		],
		[ "Collision with immovable object (top edge)", 									TestTopEdgeWithImmovableCollisionEvaluation			],
		[ "Collision with immovable object (bottom edge)", 									TestBottomEdgeWithImmovableCollisionEvaluation		],		
	];

	this.constTestDescriptionIndex = 0;
	this.constTestFunctionIndex = 1;
}

UnitTestInterface.prototype.executeTests = function () {
	var failedTestCollection = [];

	for (var testLoop = 0; testLoop < this.testCollection.length; testLoop++) {
		
		var currentTestFunction = this.testCollection[testLoop][this.constTestFunctionIndex];
		if (!currentTestFunction()) {
			failedTestCollection.push(this.testCollection[testLoop][this.constTestDescriptionIndex]);
		}
	}
	
	if (failedTestCollection.length > 0) {
		var failedTestsString = "Test Failures Occurred:\n\n";
		
		for (var failedTestLoop = 0; failedTestLoop < failedTestCollection.length; failedTestLoop++) {
			failedTestsString += failedTestCollection[failedTestLoop] + "\n";			
		}
		
		alert(failedTestsString);
	}
}

function TestResourceCatalogParsing() {
	var resourceCatalog = 
	'{' +
		'"resourceCatalog":' +
		'[' +
		'	{' +
		'		"key": "firstItem",' +
		'		"uri": "data/firstItem.txt",' +
		'		"binaryFlag": false' +
		'	},' +
		'	{' +
		'		"key": "secondItem",' +
		'		"uri": "data/secondItem.txt",' +
		'		"binaryFlag": true' +
		'	},' +
		'	{' +
		'		"key": "thirdItem",' +
		'		"uri": "data/thirdItem.txt",' +
		'		"binaryFlag": true' +
		'	},' +
		'	{' +
		'		"key": "fourthItem",' +
		'		"uri": "data/fourthItem.dat",' +
		'		"resourceType": "textureResource",' +
		'		"binaryFlag": true' +
		'	}' +
		']' +
		'' +
	'}';
	
	var parser = new ResourceCatalogParser();
	var parsedCatalog = parser.parseCataog(resourceCatalog);

	return (parsedCatalog.length == 4) &&
		(parsedCatalog[1].key === "secondItem") &&
		(parsedCatalog[2].binaryFlag === true) &&
		(parsedCatalog[3].resourceType === ResourceCatalogParser.resourceTypeSpecifierTexture);
		(parsedCatalog[3].uri === "data/fourthItem.dat");
}

function TestEmptyCollisionEdgeInfoDetermination() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(-1.0, 0.0),
		0.0,
		new Rectangle(-10.0, 10.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(1.0, 0.0),
		0.0,
		new Rectangle(10.0, 10.0, 10.0, 10.0));

	var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(
		body1, body2);

	return (collisionEdgeInfo !== null) && (collisionEdgeInfo.length === 0);
}

function TestTopCollisionEdgeInfoDetermination() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(0.0, 1.0),
		0.0,
		new Rectangle(0.0, 0.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		Infinity,
		new Vector(0.0, 0.0),
		0.0,
		new Rectangle(0.0, 10.0, 10.0, 10.0));

	var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(
		body1, body2);

	return (collisionEdgeInfo !== null) && (collisionEdgeInfo.length === 1) &&
		(collisionEdgeInfo[0].collisionEdge === SimplifiedRectPhysics.rectEdge.top);
}

function TestBottomCollisionEdgeInfoDetermination() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(0.0, -1.0),
		0.0,
		new Rectangle(0.0, 10.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		Infinity,
		new Vector(0.0, 0.0),
		0.0,
		new Rectangle(0.0, 0.0, 10.0, 10.0));

	var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(
		body1, body2);

	return (collisionEdgeInfo !== null) && (collisionEdgeInfo.length === 1) &&
		(collisionEdgeInfo[0].collisionEdge === SimplifiedRectPhysics.rectEdge.bottom);
}

function TestLeftCollisionEdgeInfoDetermination() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(-1.0, 0.0),
		0.0,
		new Rectangle(0.0, 0.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		Infinity,
		new Vector(0.0, 0.0),
		0.0,
		new Rectangle(-10.0, 0.0, 10.0, 10.0));

	var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(
		body1, body2);

	return (collisionEdgeInfo !== null) && (collisionEdgeInfo.length === 1) &&
		(collisionEdgeInfo[0].collisionEdge === SimplifiedRectPhysics.rectEdge.left);
}

function TestRightCollisionEdgeInfoDetermination() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(1.0, 0.0),
		0.0,
		new Rectangle(0.0, 0.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		Infinity,
		new Vector(0.0, 0.0),
		0.0,
		new Rectangle(10.0, 0.0, 10.0, 10.0));

	var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(
		body1, body2);

	return (collisionEdgeInfo !== null) && (collisionEdgeInfo.length === 1) &&
		(collisionEdgeInfo[0].collisionEdge === SimplifiedRectPhysics.rectEdge.right);
}

function TestLeftEdgeWithImmovableCollisionEvaluation() {
	var body1 = new SimplifiedRectPhysicsBody(
		1.0,
		new Vector(1.0, 0.0),
		1.0,
		new Rectangle(0.0, 0.0, 10.0, 10.0));
		
	var body2 = new SimplifiedRectPhysicsBody(
		Infinity,
		new Vector(0.0, 0.0),
		1.0,
		new Rectangle(10.0, 0.0, 10.0, 10.0));

	var evaluatedSystem = SimplifiedRectPhysics.evaluateCollision(body1, body2);
	
	return (evaluatedSystem != null) &&
		(evaluatedSystem.body1.velocity.getXComponent() <= 0.0) &&
		(evaluatedSystem.body2.velocity.magnitude() < 0.001);
}

function TestRightEdgeWithImmovableCollisionEvaluation() {
	SimplifiedRectPhysics.evaluateCollision();
	
	return true;
}

function TestTopEdgeWithImmovableCollisionEvaluation() {
	SimplifiedRectPhysics.evaluateCollision();
	
	return true;
}

function TestBottomEdgeWithImmovableCollisionEvaluation() {
	SimplifiedRectPhysics.evaluateCollision();
	
	return true;
}