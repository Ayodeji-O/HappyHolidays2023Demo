// FragmentShaderGingerManGourad.shader - Generic gouraud shading
//                                        fragment shader, modified for
//                                        Gingerbread Man surface rendering

// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform mediump vec3 uniform_ambientLightVector;
varying mediump vec3 vNormalVector;
varying mediump vec3 vPosition;

varying lowp vec4 vBaseFragmentColor;

uniform mediump vec4 uniform_pointLightColor;
uniform mediump vec3 uniform_pointLightPosition;
uniform mediump float uniform_pointLightContributionFraction;
uniform mediump float uniform_deteriorationFactor;

const mediump float gingerManSurfaceTextureDepth = 0.4;

// 2D Random
// https://thebookofshaders.com/11/
highp float random (in highp vec2 st) {
	const highp float pi = acos(-1.0);
	const highp vec2 randomRefVector = vec2(12.9898, 78.233);
	highp float dotProductResult = dot(st.xy, randomRefVector);
    return fract(sin(mod(dotProductResult, 2.0 * pi)) * 43758.5453123);
}

void main() {
	const mediump float lightContributionFraction = 0.8;
	const mediump vec4 ambientLightColor = vec4(1.0, 1.0, 1.0, 1.0);
	const mediump vec4 baseIllumination = vec4(1.0, 1.0, 1.0, 1.0);

	mediump float resolvedDeteriorationFactor = clamp(uniform_deteriorationFactor, 0.0, 1.0);
	mediump vec3 deteriorationModifierVector = max((resolvedDeteriorationFactor * 1.2), gingerManSurfaceTextureDepth) * normalize(
		vec3(
			random(vPosition.xy),
			random(vPosition.yz),
			random(vPosition.zz)
		)
	);
	
	mediump vec3 alteredNormalVector = normalize(normalize(vNormalVector) + deteriorationModifierVector);

	mediump float ambientContributionFraction = (lightContributionFraction - (lightContributionFraction * uniform_pointLightContributionFraction));
	mediump float ambientDotProduct = dot(normalize(alteredNormalVector), -normalize(uniform_ambientLightVector));
	mediump float pointLightDotProduct = dot(normalize(alteredNormalVector), normalize(vPosition.xyz - uniform_pointLightPosition.xyz));
	mediump float baseContributionFraction = 1.0 - lightContributionFraction;

	mediump vec4 ambientContibution = vec4(ambientLightColor.xyz * pow(abs(ambientDotProduct), 1.0) * ambientContributionFraction, 1.0);
	mediump vec4 baseContribution = vec4(baseIllumination.xyz * baseContributionFraction, 1.0);
	mediump vec4 pointLightColor = uniform_pointLightColor * (1.0 / pow(distance(uniform_pointLightPosition, vPosition), 2.0));
	mediump vec4 pointLightContribution = vec4(pointLightColor.xyz * abs(pointLightDotProduct) * uniform_pointLightContributionFraction, 1.0);	
	
	mediump vec4 totalLightContribution = vec4(baseContribution.xyz + ambientContibution.xyz + pointLightContribution.xyz, 1.0);
	
	mediump float deteriorationDarkeningFactor = (1.0 - resolvedDeteriorationFactor * 0.5);
	gl_FragColor = vec4(clamp((vBaseFragmentColor * totalLightContribution).xyz * deteriorationDarkeningFactor, 0.0, 1.0), 1.0);
}