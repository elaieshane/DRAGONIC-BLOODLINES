/**
 * CraftPix Integration Showcase
 * Demonstrates all CraftPix features: UI components, environments, and NPCs
 */

import React, { useState } from "react";
import {
  CraftPixButton,
  CraftPixPanel,
  CraftPixTabs,
  CraftPixDialog,
  CraftPixBadge,
  CraftPixGrid,
  CraftPixCard,
  PIXEL_THEME,
} from "./CraftPixUI";
import {
  EnvironmentBuilder,
  EnvironmentCanvas,
  generateEnvironment,
  EnvironmentMap,
} from "./CraftPixEnvironment";
import { NPCAvatar, NPCDialogue, NPCRoster, PREDEFINED_NPCS } from "./CraftPixNPC";

interface CraftPixShowcaseProps {
  onClose?: () => void;
}

/**
 * Main CraftPix Integration Showcase
 */
export const CraftPixShowcase: React.FC<CraftPixShowcaseProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(PREDEFINED_NPCS[0]);
  const [environment, setEnvironment] = useState<EnvironmentMap>(() =>
    generateEnvironment({
      width: 16,
      height: 12,
      theme: "dungeon",
      waterLevel: 0.3,
      decorationDensity: 0.1,
    })
  );

  const tabs = [
    {
      label: "UI Components",
      content: (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: PIXEL_THEME.gold, marginTop: 0 }}>CraftPix UI Components</h3>

          <CraftPixPanel title="Buttons" variant="dark">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              <CraftPixButton variant="primary">Primary</CraftPixButton>
              <CraftPixButton variant="secondary">Secondary</CraftPixButton>
              <CraftPixButton variant="danger">Danger</CraftPixButton>
              <CraftPixButton variant="success">Success</CraftPixButton>
              <CraftPixButton disabled>Disabled</CraftPixButton>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <CraftPixButton size="small">Small</CraftPixButton>
              <CraftPixButton size="medium">Medium</CraftPixButton>
              <CraftPixButton size="large">Large</CraftPixButton>
            </div>
          </CraftPixPanel>

          <CraftPixPanel title="Badges" variant="dark">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <CraftPixBadge variant="gold">Gold</CraftPixBadge>
              <CraftPixBadge variant="red">Red</CraftPixBadge>
              <CraftPixBadge variant="green">Green</CraftPixBadge>
              <CraftPixBadge variant="blue">Blue</CraftPixBadge>
            </div>
          </CraftPixPanel>

          <CraftPixPanel title="Cards" variant="dark">
            <CraftPixGrid columns={3}>
              <CraftPixCard
                title="Card One"
                subtitle="Clickable"
                onClick={() => alert("Card clicked!")}
              >
                This is a sample card with interactive hover effects.
              </CraftPixCard>
              <CraftPixCard title="Card Two" subtitle="With Image">
                Card with optional image support for asset showcase.
              </CraftPixCard>
              <CraftPixCard title="Card Three" subtitle="Flexible">
                Responsive grid layout that adapts to screen size.
              </CraftPixCard>
            </CraftPixGrid>
          </CraftPixPanel>

          <CraftPixPanel title="Dialog" variant="dark">
            <CraftPixButton onClick={() => setDialogOpen(true)}>Open Dialog</CraftPixButton>
            <CraftPixDialog
              title="Welcome to CraftPix"
              isOpen={dialogOpen}
              onClose={() => setDialogOpen(false)}
              actions={[
                { label: "Cancel", onClick: () => setDialogOpen(false) },
                {
                  label: "Accept",
                  onClick: () => {
                    alert("Accepted!");
                    setDialogOpen(false);
                  },
                  variant: "success",
                },
              ]}
            >
              <p>This is a pixel-art themed dialog with customizable actions.</p>
              <p>Perfect for quests, confirmations, and interactive storytelling.</p>
            </CraftPixDialog>
          </CraftPixPanel>
        </div>
      ),
    },
    {
      label: "Environments",
      content: (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: PIXEL_THEME.gold, marginTop: 0 }}>Dungeon Environment Builder</h3>
          <EnvironmentBuilder
            onEnvironmentChange={(env) => setEnvironment(env)}
          />
        </div>
      ),
    },
    {
      label: "NPCs",
      content: (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: PIXEL_THEME.gold, marginTop: 0 }}>Medieval NPC Avatars</h3>

          <CraftPixPanel title="NPC Roster" variant="dark">
            <NPCRoster
              npcs={PREDEFINED_NPCS}
              onNPCSelect={(npc) => setSelectedNPC(npc)}
            />
          </CraftPixPanel>

          <CraftPixPanel title="Selected NPC Dialogue" variant="dark">
            <NPCDialogue
              npc={selectedNPC}
              text="Greetings, traveler! I sense great potential in you. The realm needs heroes now more than ever..."
            />
          </CraftPixPanel>
        </div>
      ),
    },
    {
      label: "Integration Guide",
      content: (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: PIXEL_THEME.gold, marginTop: 0 }}>CraftPix Integration Guide</h3>

          <CraftPixPanel title="Quick Start" variant="light">
            <h4 style={{ color: PIXEL_THEME.dark, marginTop: 0 }}>Import CraftPix Components</h4>
            <pre
              style={{
                backgroundColor: PIXEL_THEME.dark,
                color: "#0f0",
                padding: "12px",
                borderRadius: "2px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
{`import {
  CraftPixButton,
  CraftPixPanel,
  CraftPixDialog,
} from "./CraftPixUI";

import {
  EnvironmentBuilder,
  EnvironmentCanvas,
} from "./CraftPixEnvironment";

import {
  NPCAvatar,
  NPCDialogue,
  PREDEFINED_NPCS,
} from "./CraftPixNPC";`}
            </pre>
          </CraftPixPanel>

          <CraftPixPanel title="Asset Structure" variant="light">
            <p style={{ color: PIXEL_THEME.dark, margin: "0 0 8px 0" }}>
              <strong>CraftPix assets are organized in:</strong>
            </p>
            <ul style={{ color: PIXEL_THEME.dark, margin: "0", paddingLeft: "20px" }}>
              <li>Tilesets: Dungeon, Ruins, Cursed, Undead</li>
              <li>UI Assets: Medieval NPC avatars with 6 emotions</li>
              <li>Character Sprites: Werewolf, Gorgon, Demon, Dark Elf</li>
            </ul>
          </CraftPixPanel>

          <CraftPixPanel title="Usage Examples" variant="light">
            <h4 style={{ color: PIXEL_THEME.dark, marginTop: 0 }}>Environment Generation:</h4>
            <pre
              style={{
                backgroundColor: PIXEL_THEME.dark,
                color: "#0f0",
                padding: "12px",
                borderRadius: "2px",
                fontSize: "11px",
                marginTop: "8px",
              }}
            >
{`const env = generateEnvironment({
  width: 16,
  height: 12,
  theme: "dungeon",
  waterLevel: 0.3,
});

<EnvironmentCanvas environment={env} />`}
            </pre>

            <h4 style={{ color: PIXEL_THEME.dark, marginTop: "12px", marginBottom: 0 }}>
              UI Components:
            </h4>
            <pre
              style={{
                backgroundColor: PIXEL_THEME.dark,
                color: "#0f0",
                padding: "12px",
                borderRadius: "2px",
                fontSize: "11px",
                marginTop: "8px",
              }}
            >
{`<CraftPixPanel title="Settings">
  <CraftPixButton variant="primary">
    Save
  </CraftPixButton>
</CraftPixPanel>`}
            </pre>
          </CraftPixPanel>

          <CraftPixPanel title="Asset Paths" variant="light">
            <p style={{ color: PIXEL_THEME.dark, margin: "0", fontSize: "12px" }}>
              All assets are referenced from the workspace root. Examples:
            </p>
            <ul style={{ color: PIXEL_THEME.dark, margin: "8px 0 0 0", paddingLeft: "20px", fontSize: "11px" }}>
              <li>NPCs: `/craftpix-net-934138.../NPC_1/Smile.png`</li>
              <li>Tilesets: `/craftpix-net-169442.../PNG/walls_floor.png`</li>
            </ul>
          </CraftPixPanel>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: PIXEL_THEME.dark,
        color: PIXEL_THEME.light,
        minHeight: "100vh",
        padding: "16px",
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h1
            style={{
              margin: "0",
              color: PIXEL_THEME.gold,
              fontSize: "32px",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            🎨 CraftPix Integration
          </h1>
          {onClose && (
            <CraftPixButton onClick={onClose} size="small">
              Close
            </CraftPixButton>
          )}
        </div>

        <CraftPixTabs
          tabs={tabs}
          defaultTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default CraftPixShowcase;
