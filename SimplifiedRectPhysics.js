// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  Primitives.js
//  Utility.js

var SimplifiedRectPhysics = {}

SimplifiedRectPhysics.millisecondsPerSecond = 1000;

SimplifiedRectPhysics.constDefaultGravitationalAcceleration = 9.8 /
	(SimplifiedRectPhysics.millisecondsPerSecond * SimplifiedRectPhysics.millisecondsPerSecond);


/**
 * Value used to represent approximate numeric equality.
 */
SimplifiedRectPhysics.constNumberEpsilon = Number.EPSILON * 100.0;

/**
 *
 * @param body1 {SimplifiedRectPhysicsBody} First object in the collision evaluation
 * @param body2 {SimplifiedRectPhysicsBody} Second object in the collision evaluation
 * @param exclusionEdges {Array} Collection of edges that will not be evaluated for
 *                               body1 (optional)
 *
 * @return {SimplifiedRectPhysicsEvaluatedSystem} Evaluated collision system, representing
 *                                                the results of the collision
 */
SimplifiedRectPhysics.evaluateCollision = function(body1, body2, exclusionEdges) {
	var evaluatedSystem = null;

	if (Utility.validateVarAgainstType(body1, SimplifiedRectPhysicsBody) &&
		Utility.validateVarAgainstType(body2, SimplifiedRectPhysicsBody)
	) {	
		if (body1.bounds.intersectsRect(body2.bounds)) {
			// Use elasticity average as the coefficient of restitution
			var coeffRestitution = (body1.elasticity + body2.elasticity) / 2.0;
			var collisionEdgeInfo = SimplifiedRectPhysics.collisionEdgeInfo(body1,
				body2, exclusionEdges);
			if ((collisionEdgeInfo !== null) && (collisionEdgeInfo.length > 0)){
				evaluatedSystem = SimplifiedRectPhysics.composeEvaluatedSystem(body1, body2,
					collisionEdgeInfo, coeffRestitution);
			}
		}
	}

	return evaluatedSystem;
}

/**
 * Determines if a collision exists between two objects, returning
 *  a collection of potential edges at which the collision
 *  occurred
 *
 * @param body1 {SimplifiedRectPhysicsBody} First object in the collision evaluation
 * @param body2 {SimplifiedRectPhysicsBody} Second object in the collision evaluation
 * @param exclusionEdges {Array} Collection of edges on the first object to be
 *                               excluded from the collision evaluation operation
 *
 * @return SimplifiedRectPhysicsCollisionEdgeInfo collection upon success
 *         (represents collision edges that correspond to the first object
 *         edges - can be empty); null otherwise
 *
 * @see SimplifiedRectPhysics.rectEdge.left
 * @see SimplifiedRectPhysics.rectEdge.right
 * @see SimplifiedRectPhysics.rectEdge.bottom
 * @see SimplifiedRectPhysics.rectEdge.top
 */
SimplifiedRectPhysics.collisionEdgeInfo = function(body1, body2, exclusionEdges) {
	var edgeInfoCollection = [];
	
	if (Utility.validateVarAgainstType(body1, SimplifiedRectPhysicsBody) &&
		Utility.validateVarAgainstType(body2, SimplifiedRectPhysicsBody)
	) {
		var resolvedExclusionEdges = Utility.validateVar(exclusionEdges)
			? exclusionEdges
			: [];

		// Evaluate edge collisions. A collision is considered to be
		// valid if it does not extend beyond the centerline along the
		// associated target object axis.

		// First body left side collision
		var leftEdgeIngress = (body2.bounds.left + body2.bounds.getWidth()) -
			body1.bounds.left;
		// First body right side collision
		var rightEdgeIngress = (body1.bounds.left + body1.bounds.getWidth()) -
			body2.bounds.left;
		// First body top side collision		
		var topEdgeIngress = body1.bounds.top -
			(body2.bounds.top - body2.bounds.getHeight());
		// First body bottom side collision
		var bottomEdgeIngress = body2.bounds.top -
			(body1.bounds.top - body1.bounds.getHeight());
		
		var relativeBody1VelocityX = body1.velocity.getXComponent() -
			body2.velocity.getXComponent();
		var relativeBody1VelocityY = body1.velocity.getYComponent() -
			body2.velocity.getYComponent();
			
		if ((relativeBody1VelocityX > 0.0) && (rightEdgeIngress >= -SimplifiedRectPhysics.constNumberEpsilon) &&
			(rightEdgeIngress <= (body2.bounds.getWidth() / 2.0) &&
			!resolvedExclusionEdges.includes(SimplifiedRectPhysics.rectEdge.right))
		) {
			// First body right edge collision
			edgeInfoCollection.push(
				new SimplifiedRectPhysicsCollisionEdgeInfo(
					SimplifiedRectPhysics.rectEdge.right,
					rightEdgeIngress)
				);
		}
		else if ((relativeBody1VelocityX < 0.0) && (leftEdgeIngress >= -SimplifiedRectPhysics.constNumberEpsilon) &&
			(leftEdgeIngress <= (body2.bounds.getWidth() / 2.0) &&
			!resolvedExclusionEdges.includes(SimplifiedRectPhysics.rectEdge.left))
		) {
			// First body left edge collision
			edgeInfoCollection.push(
				new SimplifiedRectPhysicsCollisionEdgeInfo(
					SimplifiedRectPhysics.rectEdge.left,
					leftEdgeIngress)
				);
		}
		
		if ((relativeBody1VelocityY > 0.0) && (topEdgeIngress >= -SimplifiedRectPhysics.constNumberEpsilon) &&
			(topEdgeIngress <= (body2.bounds.getHeight() / 2.0) &&
			!resolvedExclusionEdges.includes(SimplifiedRectPhysics.rectEdge.top))
		) {
			// Potential first body top edge collision
			edgeInfoCollection.push(
				new SimplifiedRectPhysicsCollisionEdgeInfo(
					SimplifiedRectPhysics.rectEdge.top,
					topEdgeIngress)
				);
		} else if ((relativeBody1VelocityY < 0.0) && (bottomEdgeIngress >= -SimplifiedRectPhysics.constNumberEpsilon) &&
			(bottomEdgeIngress <= (body2.bounds.getHeight() / 2.0) &&
			!resolvedExclusionEdges.includes(SimplifiedRectPhysics.rectEdge.bottom))
		) {
			// First body bottom edge collision
			edgeInfoCollection.push(
				new SimplifiedRectPhysicsCollisionEdgeInfo(
					SimplifiedRectPhysics.rectEdge.bottom,
					bottomEdgeIngress)
				);
		}
	}
	
	return edgeInfoCollection;
}

/**
 * Determines which detected collision in a set of collisions has
 *  the greatest edge ingress 
 *
 * @param edgeInfoCollection {Array} Collection of
 *                                   SimplifiedRectPhysicsCollisionEdgeInfo
 *									 objects  (represents collision edges
 *                                   that correspond to the first object
 *                                   edges)
 *
 * @return {SimplifiedRectPhysicsCollisionEdgeInfo} Object representing the dominant
 *                                                  collision info set
 */
SimplifiedRectPhysics.dominantCollisionEdgeInfo = function(edgeInfoCollection) {
	var dominantEdgeInfo = null;

	if (Utility.validateVar(edgeInfoCollection) && (edgeInfoCollection.length > 0)) {
		var sortedEdgeInfoCollection = edgeInfoCollection.slice();
		sortedEdgeInfoCollection.sort((first, second) => first.ingress - second.ingress);
		dominantEdgeInfo = sortedEdgeInfoCollection[0];
	}

	return dominantEdgeInfo;
}

/**
 * Completes the evaluation of a collision between two physical object representations,
 *  and constructs an object representing the evaluated collision and its associated
 *  attributes; SimplifiedRectPhysics#collisionEdgeInfo should be invoked before
 *  invocation of this method
 *
 * @param body1 {SimplifiedRectPhysicsBody} First object in the collision evaluation
 * @param body2 {SimplifiedRectPhysicsBody} Second object in the collision evaluation
 * @param body1EdgeInfoCollection {Array} Collection of SimplifiedRectPhysicsCollisionEdgeInfo
 *                                        objects, generated by SimplifiedRectPhysics#collisionEdgeInfo
 * @param coeffRestitution {number} Coefficient of restitution to be used
 *                                  for post-collision velocity resolution
 *
 * @return {SimplifiedRectPhysicsEvaluatedSystem} Evaluated collision system, representing
 *                                                the results of the collision
 *
 * @see SimplifiedRectPhysics#collisionEdgeInfo
 */
SimplifiedRectPhysics.composeEvaluatedSystem = function(body1, body2, body1EdgeInfoCollection,
	coeffRestitution
) {
	var evaluatedSystem = null;

	if (Utility.validateVarAgainstType(body1, SimplifiedRectPhysicsBody) &&
		Utility.validateVarAgainstType(body2, SimplifiedRectPhysicsBody) &&
		Utility.validateVar(body1EdgeInfoCollection)
	) {
		var dominantEdgeInfo = SimplifiedRectPhysics.dominantCollisionEdgeInfo(
			body1EdgeInfoCollection);

		var alteredBody1 = null;
		var alteredBody2 = null;
		if ((body1.mass !== Infinity) && (body2.mass === Infinity)) {
			alteredBody1 = SimplifiedRectPhysics.evaluateImmovableObjectCollision(body1,
				body2, dominantEdgeInfo, false, coeffRestitution);
			alteredBody2 = body2;
		}
		if ((body1.mass === Infinity) && (body2.mass !== Infinity)) {
			alteredBody2 = SimplifiedRectPhysics.evaluateImmovableObjectCollision(body2,
				body1, dominantEdgeInfo, true, coeffRestitution);
			alteredBody1 = body1;
		}
		else {
			
		}

		// Return the evaluated system, composed of the altered collision
		// bodies and the coincident edge (only one edge is presently
		// evaluated).
		evaluatedSystem = new SimplifiedRectPhysicsEvaluatedSystem(alteredBody1,
			alteredBody2, [dominantEdgeInfo.collisionEdge]);
	}

	return evaluatedSystem;
}

/**
 * Evaluates the results of a collision between two objects, one of
 *  which is considered to be immovable
 *
 * @param targetBody {SimplifiedRectPhysicsBody} First object in the collision evaluation (moveable)
 * @param immoveableBody {SimplifiedRectPhysicsBody} Second object in the collision evaluation (immoveable)
 * @param body1CollisionEdgeInfo {SimplifiedRectPhysicsCollisionEdgeInfo} Information detailing the
 *                                                                        edge on which the collision
 *                                                                        is to be evaluated
 *                                                                        (determined by
 *                                                                        SimplifiedRectPhysics#collisionEdgeInfo)
 * @param invertEdgeInfoRelation {boolean} When set to true, body1CollisionEdgeInfo
 *                                         corresponds to collision edge information
 *                                         associated with the immoveable object,
 *                                         instead of the moveable object
 * @param coeffRestitution {number} Coefficient of restitution to be used
 *                                  for post-collision velocity resolution
 *
 */
SimplifiedRectPhysics.evaluateImmovableObjectCollision = function(targetBody, immoveableBody,
	body1CollisionEdgeInfo, invertEdgeInfoRelation, coeffRestitution
) {
	if (Utility.validateVarAgainstType(targetBody, SimplifiedRectPhysicsBody) &&
		Utility.validateVarAgainstType(immoveableBody, SimplifiedRectPhysicsBody) &&
		Utility.validateVarAgainstType(body1CollisionEdgeInfo, SimplifiedRectPhysicsCollisionEdgeInfo) &&
		Utility.validateVar(coeffRestitution)
	) {
		var alteredTargetBody = targetBody.clone();

		if (body1CollisionEdgeInfo.collisionEdge === SimplifiedRectPhysics.rectEdge.left) {
			alteredTargetBody.bounds.move(
				((immoveableBody.bounds.left + immoveableBody.bounds.getWidth()) - targetBody.bounds.left) +
				SimplifiedRectPhysics.constNumberEpsilon, 0.0);
			alteredTargetBody.velocity.xComponent = (-targetBody.velocity.getXComponent() *
				Math.abs(coeffRestitution));
		}
		else if (body1CollisionEdgeInfo.collisionEdge === SimplifiedRectPhysics.rectEdge.right) {
			alteredTargetBody.bounds.move(
				(immoveableBody.bounds.left - (targetBody.bounds.left + targetBody.bounds.getWidth())) -
				SimplifiedRectPhysics.constNumberEpsilon, 0.0);			
			alteredTargetBody.velocity.xComponent = (-targetBody.velocity.getXComponent() *
				Math.abs(coeffRestitution));
		}
		else if (body1CollisionEdgeInfo.collisionEdge === SimplifiedRectPhysics.rectEdge.top) {
			alteredTargetBody.bounds.move(0.0, ((immoveableBody.bounds.top - immoveableBody.bounds.getHeight()) - targetBody.bounds.top) -
				SimplifiedRectPhysics.constNumberEpsilon);
			alteredTargetBody.velocity.yComponent = (-targetBody.velocity.getYComponent() *
				Math.abs(coeffRestitution));
		}
		else if (body1CollisionEdgeInfo.collisionEdge === SimplifiedRectPhysics.rectEdge.bottom) {
			alteredTargetBody.bounds.move(0.0, (immoveableBody.bounds.top -
				(targetBody.bounds.top - targetBody.bounds.getHeight()) +
				SimplifiedRectPhysics.constNumberEpsilon));
			alteredTargetBody.velocity.yComponent = (-targetBody.velocity.getYComponent() *
				Math.abs(coeffRestitution));
		}		
	}

	return alteredTargetBody;
}

// Represents a particular edge orientation
// in a collision
SimplifiedRectPhysics.rectEdge = {
	// Object top edge
	top: 0,
	// Object bottom edge
	bottom: 1,
	// Object left edge
	left: 2,
	// Object right edge
	right: 3
}

var SimplifiedRectPhysicsCollisionEdgeInfo = function(collisionEdge, ingress) {
	this.collisionEdge = collisionEdge
	this.ingress = ingress
}

/**
 *
 * @param mass {Number} Object mass in grams
 * @param velocity {Vector} Object velocity vector
 * @param elasticity {Number} Object elasticity factor, ranging
 *                            from 0.0 - 1.0 where (inclusive)
 *                            1.0 represents a perfectly elastic
 *                            body
 * @param bounds {Rectangle} Object bounds in a particular
 *                           coordinate space
 *
 */
var SimplifiedRectPhysicsBody = function(mass, velocity, elasticity, bounds) {
	this.mass = Utility.returnValidNumOrZero(mass);
	this.velocity = Utility.validateVarAgainstType(velocity, Vector)
		? velocity
		: Vector(0.0, 0.0);
	this.elasticity = Utility.returnValidNumOrZero(elasticity);
	this.bounds = Utility.validateVarAgainstType(bounds, Rectangle)
		? bounds
		: Rectangle(0.0, 0.0, 0.0, 0.0);
}

/**
 * Generates a copy of a SimplifiedRectPhysicsBody instance
 *
 * @return {SimplifiedRectPhysicsBody} Copy of a SimplifiedRectPhysicsBody
 *                                     instance
 */
SimplifiedRectPhysicsBody.prototype.clone = function() {
	return new SimplifiedRectPhysicsBody(this.mass,
		this.velocity, this.elasticity, this.bounds);
}

/**
 * Represents the results of an evaluated collision
 */
var SimplifiedRectPhysicsEvaluatedSystem = function(body1, body2, collisionEdges) {
	this.body1 = body1;
	this.body2 = body2;
	this.collisionEdges = collisionEdges;
}