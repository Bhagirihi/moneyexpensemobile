import React from "react";
import Svg, { Path, Circle, G, Rect, Line } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

export const ExploreWorldIllustration = ({ width = 300, height = 300 }) => {
  const { theme } = useTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 300 300">
      <G transform="translate(50, 80)">
        {/* Scooter */}
        <Path
          d="M40 120 L90 120 C100 120 110 110 110 100 L110 90"
          stroke={theme.illustrationPrimary}
          strokeWidth="3"
          fill="none"
        />
        <Circle cx="50" cy="140" r="15" fill={theme.illustrationPrimary} />
        <Circle cx="100" cy="140" r="15" fill={theme.illustrationPrimary} />
        <Path
          d="M60 90 C60 80 80 80 90 90"
          stroke={theme.illustrationPrimary}
          strokeWidth="3"
          fill="none"
        />
        <Rect
          x="85"
          y="70"
          width="10"
          height="20"
          fill={theme.illustrationPrimary}
        />

        {/* People */}
        {/* First Person */}
        <G transform="translate(70, 60)">
          <Circle cx="0" cy="0" r="12" fill={theme.illustrationSecondary} />
          <Path d="M-5 15 L5 15 L0 45 Z" fill={theme.illustrationSecondary} />
          <Path
            d="M-15 30 L15 30"
            stroke={theme.illustrationSecondary}
            strokeWidth="3"
          />
        </G>

        {/* Second Person */}
        <G transform="translate(100, 60)">
          <Circle cx="0" cy="0" r="12" fill={theme.illustrationSecondary} />
          <Path d="M-5 15 L5 15 L0 45 Z" fill={theme.illustrationSecondary} />
          <Path
            d="M-15 30 L15 30"
            stroke={theme.illustrationSecondary}
            strokeWidth="3"
          />
        </G>

        {/* Luggage */}
        <Rect
          x="130"
          y="100"
          width="20"
          height="40"
          fill={theme.illustrationSecondary}
        />
        <Rect
          x="135"
          y="95"
          width="10"
          height="5"
          fill={theme.illustrationSecondary}
        />
      </G>
    </Svg>
  );
};

export const ReachSpotIllustration = ({ width = 300, height = 300 }) => {
  const { theme } = useTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 300 300">
      <G transform="translate(50, 50)">
        {/* People jumping */}
        <Circle cx="80" cy="100" r="15" fill={theme.illustrationPrimary} />
        <Path d="M70 120 L90 120 L80 160 Z" fill={theme.illustrationPrimary} />
        <Circle cx="120" cy="80" r="15" fill={theme.illustrationSecondary} />
        <Path
          d="M110 100 L130 100 L120 140 Z"
          fill={theme.illustrationSecondary}
        />
        <Circle cx="160" cy="110" r="15" fill={theme.illustrationPrimary} />
        <Path
          d="M150 130 L170 130 L160 170 Z"
          fill={theme.illustrationPrimary}
        />
      </G>
    </Svg>
  );
};

export const ConnectIllustration = ({ width = 300, height = 300 }) => {
  const { theme } = useTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 300 300">
      <G transform="translate(50, 50)">
        {/* Person with luggage */}
        <Circle cx="100" cy="100" r="20" fill={theme.illustrationSecondary} />
        <Path
          d="M90 130 L110 130 L100 180 Z"
          fill={theme.illustrationSecondary}
        />
        <Path
          d="M140 150 L160 150 L160 190 L140 190 Z"
          fill={theme.illustrationSecondary}
        />
        {/* Tree */}
        <Circle
          cx="180"
          cy="80"
          r="40"
          fill={theme.illustrationPrimary}
          opacity={0.6}
        />
        <Path
          d="M175 120 L185 120 L180 190 Z"
          fill={theme.illustrationPrimary}
        />
      </G>
    </Svg>
  );
};
