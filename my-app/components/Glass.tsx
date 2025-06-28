// components/Glass.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, ClipPath, Defs, Rect } from 'react-native-svg';

export default function Glass({ fillPercent = 0 }) {
  const viewWidth = 140;
  const viewHeight = 250;

  const fillHeight = viewHeight * fillPercent;
  const clipY = viewHeight - fillHeight;

  return (
    <View style={{ width: viewWidth, height: viewHeight }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        <Defs>
          <ClipPath id="clip">
            <Rect x="0" y={clipY} width={viewWidth} height={fillHeight} />
          </ClipPath>
        </Defs>

        {/* Контур стакана */}
        <Path
          d="M30,10 L110,10 Q120,10 120,20 L120,230 Q120,240 110,240 L30,240 Q20,240 20,230 L20,20 Q20,10 30,10 Z"
          fill="#e0f7fa"
          stroke="#0077b6"
          strokeWidth="3"
        />

        {/* Заливка водой */}
        <Path
          d="M30,10 L110,10 Q120,10 120,20 L120,230 Q120,240 110,240 L30,240 Q20,240 20,230 L20,20 Q20,10 30,10 Z"
          fill="#00b4d8"
          clipPath="url(#clip)"
        />
      </Svg>
    </View>
  );
}
