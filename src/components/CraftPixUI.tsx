/**
 * CraftPix UI Component Library
 * Pixel art styled UI components using CraftPix medieval theme
 */

import React, { ReactNode } from "react";

// Theme colors inspired by pixel art palette
export const PIXEL_THEME = {
  dark: "#1a1a1a",
  darkBrown: "#3d2817",
  brown: "#5a3a1a",
  tan: "#8b6f47",
  light: "#d4af37",
  gold: "#ffd700",
  darkRed: "#8b0000",
  red: "#cc0000",
  darkGreen: "#004400",
  green: "#00cc00",
  darkBlue: "#000066",
  blue: "#0066ff",
  shadow: "rgba(0, 0, 0, 0.5)",
} as const;

// Base pixel border styling
const PIXEL_BORDER = `
  border: 3px solid;
  border-image: linear-gradient(135deg, #ffd700 0%, #8b6f47 25%, #3d2817 50%, #8b6f47 75%, #ffd700 100%) 1;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  image-rendering: pixelated;
`;

interface CraftPixButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
}

export const CraftPixButton: React.FC<CraftPixButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return disabled ? "#444" : PIXEL_THEME.red;
      case "success":
        return disabled ? "#444" : PIXEL_THEME.green;
      case "secondary":
        return disabled ? "#444" : PIXEL_THEME.tan;
      default:
        return disabled ? "#444" : PIXEL_THEME.gold;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { padding: "6px 12px", fontSize: "12px" };
      case "large":
        return { padding: "16px 32px", fontSize: "18px" };
      default:
        return { padding: "10px 20px", fontSize: "14px" };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: getVariantColor(),
        color: "#000",
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `2px solid ${PIXEL_THEME.darkBrown}`,
        transition: "all 0.1s",
        textShadow: "1px 1px 0px rgba(255, 215, 0, 0.3)",
        letterSpacing: "0.5px",
        ...getSizeStyle(),
      }}
      className={`craft-pixel-button ${className}`}
    >
      {children}
    </button>
  );
};

interface CraftPixPanelProps {
  title?: string;
  children: ReactNode;
  variant?: "dark" | "light";
  className?: string;
}

export const CraftPixPanel: React.FC<CraftPixPanelProps> = ({
  title,
  children,
  variant = "dark",
  className = "",
}) => {
  const bgColor = variant === "dark" ? PIXEL_THEME.darkBrown : PIXEL_THEME.tan;
  const textColor = variant === "dark" ? PIXEL_THEME.gold : PIXEL_THEME.dark;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: "16px",
        margin: "8px",
        border: `3px solid ${PIXEL_THEME.dark}`,
        boxShadow: `inset 0 0 10px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)`,
        fontFamily: '"Courier New", monospace',
        imageRendering: "pixelated",
      }}
      className={`craft-pixel-panel ${className}`}
    >
      {title && (
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "16px",
            fontWeight: "bold",
            borderBottom: `2px solid ${PIXEL_THEME.gold}`,
            paddingBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

interface CraftPixTabsProps {
  tabs: { label: string; content: ReactNode }[];
  defaultTab?: number;
  onTabChange?: (index: number) => void;
}

export const CraftPixTabs: React.FC<CraftPixTabsProps> = ({
  tabs,
  defaultTab = 0,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: `3px solid ${PIXEL_THEME.gold}`,
          marginBottom: "12px",
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            style={{
              backgroundColor:
                activeTab === index ? PIXEL_THEME.gold : PIXEL_THEME.brown,
              color: activeTab === index ? PIXEL_THEME.dark : PIXEL_THEME.gold,
              padding: "8px 16px",
              border: "2px solid",
              borderColor: activeTab === index ? PIXEL_THEME.gold : PIXEL_THEME.tan,
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "12px",
              letterSpacing: "0.5px",
              transition: "all 0.1s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab].content}</div>
    </div>
  );
};

interface CraftPixDialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: { label: string; onClick: () => void; variant?: string }[];
}

export const CraftPixDialog: React.FC<CraftPixDialogProps> = ({
  title,
  isOpen,
  onClose,
  children,
  actions,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: PIXEL_THEME.darkBrown,
          border: `4px solid ${PIXEL_THEME.gold}`,
          borderRadius: "2px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          boxShadow: `0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: PIXEL_THEME.gold,
            margin: "0 0 16px 0",
            fontSize: "20px",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderBottom: `2px solid ${PIXEL_THEME.gold}`,
            paddingBottom: "12px",
            letterSpacing: "1px",
          }}
        >
          {title}
        </h2>
        <div style={{ color: PIXEL_THEME.light, marginBottom: "24px" }}>
          {children}
        </div>
        {actions && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            {actions.map((action, index) => (
              <CraftPixButton
                key={index}
                onClick={action.onClick}
                variant={
                  (action.variant as "primary" | "secondary" | "danger" | "success") ||
                  "primary"
                }
              >
                {action.label}
              </CraftPixButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CraftPixBadgeProps {
  children: ReactNode;
  variant?: "gold" | "red" | "green" | "blue";
}

export const CraftPixBadge: React.FC<CraftPixBadgeProps> = ({
  children,
  variant = "gold",
}) => {
  const colors = {
    gold: { bg: PIXEL_THEME.gold, text: PIXEL_THEME.dark },
    red: { bg: PIXEL_THEME.red, text: "#fff" },
    green: { bg: PIXEL_THEME.green, text: PIXEL_THEME.dark },
    blue: { bg: PIXEL_THEME.blue, text: "#fff" },
  };

  const color = colors[variant];

  return (
    <span
      style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: "4px 12px",
        border: `2px solid ${PIXEL_THEME.dark}`,
        display: "inline-block",
        fontWeight: "bold",
        fontSize: "12px",
        borderRadius: "2px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {children}
    </span>
  );
};

interface CraftPixGridProps {
  columns?: number;
  gap?: number;
  children: ReactNode;
}

export const CraftPixGrid: React.FC<CraftPixGridProps> = ({
  columns = 3,
  gap = 12,
  children,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

interface CraftPixCardProps {
  image?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const CraftPixCard: React.FC<CraftPixCardProps> = ({
  image,
  title,
  subtitle,
  children,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: PIXEL_THEME.darkBrown,
        border: `2px solid ${PIXEL_THEME.gold}`,
        borderRadius: "2px",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        boxShadow: `0 4px 8px rgba(0, 0, 0, 0.3)`,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px rgba(255, 215, 0, 0.3)`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.3)`;
        }
      }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            imageRendering: "pixelated",
            borderBottom: `2px solid ${PIXEL_THEME.gold}`,
          }}
        />
      )}
      <div style={{ padding: "12px" }}>
        {title && (
          <h4
            style={{
              margin: "0 0 4px 0",
              color: PIXEL_THEME.gold,
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h4>
        )}
        {subtitle && (
          <p
            style={{
              margin: "0 0 8px 0",
              color: PIXEL_THEME.tan,
              fontSize: "12px",
            }}
          >
            {subtitle}
          </p>
        )}
        {children && (
          <p
            style={{
              margin: "0",
              color: PIXEL_THEME.light,
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          >
            {children}
          </p>
        )}
      </div>
    </div>
  );
};
