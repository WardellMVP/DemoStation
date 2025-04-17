import { ThreatScenario } from "@/lib/types";
import { scenarioYamlTemplates } from "./yaml-utils";

export const mockScenarios: ThreatScenario[] = [
  {
    id: 1,
    name: "Midnight Blizzard",
    description: "Advanced persistent threat campaign targeting cloud identities, focusing on OAuth applications and token manipulation. Also known as NOBELIUM or UNC2452.",
    folderPath: "/scenarios/apt/midnight-blizzard",
    scriptPath: "/scenarios/apt/midnight-blizzard/script.py",
    configPath: "/scenarios/apt/midnight-blizzard/config.yaml",
    readmePath: "/scenarios/apt/midnight-blizzard/README.md",
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    readmeContent: "# Midnight Blizzard\n\nThis scenario simulates techniques used by the Midnight Blizzard threat actor (formerly known as NOBELIUM) to gain persistent access to cloud resources through identity-based attacks."
  },
  {
    id: 2,
    name: "Volte Prime",
    description: "Ransomware simulation that demonstrates a full attack lifecycle from initial access to data encryption and ransom demand.",
    folderPath: "/scenarios/ransomware/volte-prime",
    scriptPath: "/scenarios/ransomware/volte-prime/script.py",
    configPath: "/scenarios/ransomware/volte-prime/config.yaml",
    readmePath: "/scenarios/ransomware/volte-prime/README.md",
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    readmeContent: "# Volte Prime\n\nThis scenario demonstrates techniques used by modern ransomware operators to gain access, escalate privileges, and encrypt critical data."
  },
  {
    id: 3,
    name: "Azure Spectre",
    description: "Cloud resource hijacking scenario demonstrating how attackers can exploit misconfigured cloud permissions to steal data and resources.",
    folderPath: "/scenarios/cloud/azure-spectre",
    scriptPath: "/scenarios/cloud/azure-spectre/script.py",
    configPath: "/scenarios/cloud/azure-spectre/config.yaml",
    readmePath: "/scenarios/cloud/azure-spectre/README.md",
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    readmeContent: "# Azure Spectre\n\nThis scenario simulates sophisticated techniques used to compromise cloud environments, with a focus on Azure resource hijacking and permission exploitation."
  },
  {
    id: 4,
    name: "DarkVision",
    description: "Supply chain compromise scenario showing how attackers can insert malicious code into the development pipeline.",
    folderPath: "/scenarios/supply-chain/darkvision",
    scriptPath: "/scenarios/supply-chain/darkvision/script.py",
    configPath: "/scenarios/supply-chain/darkvision/config.yaml",
    readmePath: "/scenarios/supply-chain/darkvision/README.md",
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    readmeContent: "# DarkVision\n\nThis scenario demonstrates techniques used by threat actors to compromise the software supply chain, focusing on package substitution and build server compromise."
  },
  {
    id: 5,
    name: "Quantum Breach",
    description: "Data exfiltration scenario demonstrating advanced techniques for stealing sensitive information while evading detection.",
    folderPath: "/scenarios/exfiltration/quantum-breach",
    scriptPath: "/scenarios/exfiltration/quantum-breach/script.py",
    configPath: "/scenarios/exfiltration/quantum-breach/config.yaml",
    readmePath: "/scenarios/exfiltration/quantum-breach/README.md",
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    readmeContent: "# Quantum Breach\n\nThis scenario demonstrates sophisticated data exfiltration techniques used by advanced persistent threats to steal intellectual property and sensitive data."
  }
];

// Helper function to get the YAML template for a specific scenario
export function getScenarioYamlTemplate(scenarioName: string): string {
  const normalizedName = scenarioName.toLowerCase().replace(/\s+/g, "");
  
  switch (normalizedName) {
    case "midnightblizzard":
      return scenarioYamlTemplates.midnightBlizzard;
    case "volteprime":
      return scenarioYamlTemplates.voltePrime;
    case "azurespectre":
      return scenarioYamlTemplates.azureSpectre;
    case "darkvision":
      return scenarioYamlTemplates.darkvision;
    case "quantumbreach":
      return scenarioYamlTemplates.quantumBreach;
    default:
      return scenarioYamlTemplates.midnightBlizzard; // Default template
  }
}