/**
 * CraftPix NPC Avatar System
 * Displays NPC avatars with dynamic emotion states from CraftPix medieval pack
 */

import React, { useMemo } from "react";
import { PIXEL_THEME } from "./CraftPixUI";

export type NPCEmotion = "Aggression" | "Calm" | "Sadness" | "Smile" | "Special" | "Talk";
export type NPCID = "NPC_1" | "NPC_2" | "NPC_3" | "NPC_4";

export interface NPC {
  id: NPCID;
  name: string;
  title: string;
  emotion: NPCEmotion;
  dialogue?: string;
}

interface NPCAvatarProps {
  npc: NPC;
  size?: "small" | "medium" | "large";
  showName?: boolean;
  onClick?: () => void;
}

/**
 * NPC Avatar Display Component
 */
export const NPCAvatar: React.FC<NPCAvatarProps> = ({
  npc,
  size = "medium",
  showName = true,
  onClick,
}) => {
  const sizeMap = {
    small: { container: 80, font: 10 },
    medium: { container: 120, font: 12 },
    large: { container: 160, font: 14 },
  };

  const dimensions = sizeMap[size];

  // Construct path to NPC avatar image
  const imagePath = `/craftpix-net-934138-free-medieval-npc-avatars-pixel-pack-for-dialogue/${npc.id}/${npc.emotion}.png`;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: PIXEL_THEME.darkBrown,
        border: `2px solid ${PIXEL_THEME.gold}`,
        borderRadius: "4px",
        padding: "8px",
        width: dimensions.container,
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        boxShadow: `0 4px 8px rgba(0, 0, 0, 0.3)`,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px rgba(255, 215, 0, 0.4)`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.3)`;
        }
      }}
    >
      <img
        src={imagePath}
        alt={npc.name}
        style={{
          width: "100%",
          height: dimensions.container - 16,
          objectFit: "contain",
          imageRendering: "pixelated",
          marginBottom: "4px",
        }}
      />
      {showName && (
        <>
          <p
            style={{
              margin: "4px 0 0 0",
              color: PIXEL_THEME.gold,
              fontSize: `${dimensions.font}px`,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {npc.name}
          </p>
          <p
            style={{
              margin: "2px 0 0 0",
              color: PIXEL_THEME.tan,
              fontSize: `${dimensions.font - 2}px`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {npc.emotion}
          </p>
        </>
      )}
    </div>
  );
};

interface NPCDialogueProps {
  npc: NPC;
  text: string;
}

/**
 * NPC Dialogue Box with Avatar
 */
export const NPCDialogue: React.FC<NPCDialogueProps> = ({ npc, text }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        backgroundColor: PIXEL_THEME.darkBrown,
        border: `3px solid ${PIXEL_THEME.gold}`,
        borderRadius: "4px",
        padding: "16px",
        maxWidth: "600px",
      }}
    >
      <div>
        <NPCAvatar npc={npc} size="medium" showName={false} />
      </div>
      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: "0 0 4px 0",
            color: PIXEL_THEME.gold,
            textTransform: "uppercase",
            fontSize: "14px",
            letterSpacing: "1px",
          }}
        >
          {npc.name}
        </h4>
        <p
          style={{
            margin: "0 0 8px 0",
            color: PIXEL_THEME.tan,
            fontSize: "11px",
          }}
        >
          {npc.title}
        </p>
        <p
          style={{
            margin: "0",
            color: PIXEL_THEME.light,
            fontSize: "13px",
            lineHeight: "1.5",
            fontStyle: "italic",
          }}
        >
          "{text}"
        </p>
      </div>
    </div>
  );
};

interface NPCRosterProps {
  npcs: NPC[];
  onNPCSelect?: (npc: NPC) => void;
}

/**
 * NPC Roster Display
 */
export const NPCRoster: React.FC<NPCRosterProps> = ({ npcs, onNPCSelect }) => {
  const grouped = useMemo(() => {
    const groups: Record<NPCID, NPC[]> = {
      NPC_1: [],
      NPC_2: [],
      NPC_3: [],
      NPC_4: [],
    };

    npcs.forEach((npc) => {
      groups[npc.id].push(npc);
    });

    return groups;
  }, [npcs]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        padding: "16px",
        backgroundColor: PIXEL_THEME.dark,
        borderRadius: "4px",
      }}
    >
      {Object.entries(grouped).map(([id, npcList]) =>
        npcList.map((npc) => (
          <div
            key={`${npc.id}-${npc.emotion}`}
            onClick={() => onNPCSelect?.(npc)}
            style={{ cursor: "pointer" }}
          >
            <NPCAvatar npc={npc} size="large" showName={true} />
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Predefined NPC roster from CraftPix medieval pack
 */
export const PREDEFINED_NPCS: NPC[] = [
  {
    id: "NPC_1",
    name: "Lord Castellan",
    title: "Castle Guard Commander",
    emotion: "Aggression",
  },
  {
    id: "NPC_1",
    name: "Lord Castellan",
    title: "Castle Guard Commander",
    emotion: "Calm",
  },
  {
    id: "NPC_1",
    name: "Lord Castellan",
    title: "Castle Guard Commander",
    emotion: "Talk",
  },
  {
    id: "NPC_2",
    name: "Alira the Sage",
    title: "Village Mystic",
    emotion: "Calm",
  },
  {
    id: "NPC_2",
    name: "Alira the Sage",
    title: "Village Mystic",
    emotion: "Smile",
  },
  {
    id: "NPC_2",
    name: "Alira the Sage",
    title: "Village Mystic",
    emotion: "Talk",
  },
  {
    id: "NPC_3",
    name: "Krendel the Merchant",
    title: "Traveling Trader",
    emotion: "Smile",
  },
  {
    id: "NPC_3",
    name: "Krendel the Merchant",
    title: "Traveling Trader",
    emotion: "Talk",
  },
  {
    id: "NPC_3",
    name: "Krendel the Merchant",
    title: "Traveling Trader",
    emotion: "Aggression",
  },
  {
    id: "NPC_4",
    name: "Silas the Dark",
    title: "Cursed Sorcerer",
    emotion: "Sadness",
  },
  {
    id: "NPC_4",
    name: "Silas the Dark",
    title: "Cursed Sorcerer",
    emotion: "Special",
  },
  {
    id: "NPC_4",
    name: "Silas the Dark",
    title: "Cursed Sorcerer",
    emotion: "Aggression",
  },
];
