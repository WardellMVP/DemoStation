import jsYaml from "js-yaml";

export function parseYaml(yamlString: string): any {
  try {
    return jsYaml.load(yamlString);
  } catch (error) {
    console.error("Error parsing YAML:", error);
    return null;
  }
}

export function stringifyYaml(data: any): string {
  try {
    return jsYaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
  } catch (error) {
    console.error("Error stringifying YAML:", error);
    return "";
  }
}

export function validateYaml(yamlString: string): { isValid: boolean; error?: string } {
  try {
    jsYaml.load(yamlString);
    return { isValid: true };
  } catch (error) {
    const err = error as Error;
    return { 
      isValid: false, 
      error: err.message || "Invalid YAML syntax" 
    };
  }
}

// Example scenario YAML templates
export const scenarioYamlTemplates = {
  midnightBlizzard: `name: Midnight Blizzard
type: apt
description: Simulates a sophisticated nation-state attack targeting cloud infrastructure
severity: critical
tags:
  - nation-state
  - apt29
  - nobellium
parameters:
  target_domain: example.org
  persistence_days: 90
  data_exfiltration: true
  attack_chain:
    - initial_access:
        method: spear_phishing
        target_roles: ["admin", "developer"]
    - credential_theft:
        method: token_stealing
        target: oauth_tokens
    - lateral_movement:
        method: identity_federation_abuse
    - privilege_escalation:
        method: service_principal_abuse
    - data_exfiltration:
        method: encrypted_channels
        encryption: custom_algorithm
        c2_domains: ["legit-looking-domain.com"]
mitigations:
  - implement_mfa
  - monitor_service_principal_activity
  - enforce_conditional_access_policies
  - implement_jit_access
  - deploy_oauth_app_monitoring
`,

  voltePrime: `name: Volte Prime
type: ransomware
description: Simulates a multi-stage ransomware attack targeting critical infrastructure
severity: critical
tags:
  - ransomware
  - data_encryption
  - financial
parameters:
  target_sector: healthcare
  encryption_type: symmetric
  ransom_amount: 500000
  cryptocurrency: monero
  attack_chain:
    - initial_access:
        method: vulnerable_vpn
        target: unpatched_appliances
    - persistence:
        method: scheduled_tasks
        location: system32
    - privilege_escalation:
        method: kernel_exploit
        cve: "CVE-2023-XXXX"
    - lateral_movement:
        method: smb_exploitation
    - data_encryption:
        method: custom_ransomware
        file_types: [".doc", ".pdf", ".xls", ".jpg", ".sql"]
mitigations:
  - regular_patching
  - network_segmentation
  - offline_backups
  - application_whitelisting
  - endpoint_detection
`,

  azureSpectre: `name: Azure Spectre
type: cloud_attack
description: Demonstrates sophisticated cloud resource hijacking and account takeover techniques
severity: high
tags:
  - cloud
  - azure
  - resource_hijacking
parameters:
  target_cloud: azure
  attack_duration_hours: 48
  resource_types:
    - storage_accounts
    - virtual_machines
    - key_vaults
  attack_chain:
    - initial_access:
        method: stolen_credentials
        target: cloud_admin
    - persistence:
        method: backdoor_functions
        location: serverless_functions
    - privilege_escalation:
        method: role_assignment_abuse
        target_role: contributor
    - credential_access:
        method: key_vault_secrets_extraction
    - resource_theft:
        method: vm_snapshot
        target: production_databases
mitigations:
  - implement_pim
  - enforce_least_privilege
  - enable_defender_for_cloud
  - implement_resource_locks
  - deploy_cloud_security_posture_management
`,

  darkvision: `name: DarkVision
type: supply_chain
description: Emulates a sophisticated software supply chain attack targeting development pipelines
severity: critical
tags:
  - supply_chain
  - code_injection
  - backdoor
parameters:
  target_pipeline: ci_cd
  backdoor_type: remote_access_trojan
  package_type: npm
  persistence_mechanism: signed_packages
  attack_chain:
    - initial_access:
        method: compromised_dependency
        package_name: "crypto-utils"
    - execution:
        method: malicious_install_script
        trigger: post_install
    - persistence:
        method: dependency_confusion
        legitimate_package: "corp-auth-lib"
    - defense_evasion:
        method: code_obfuscation
        technique: string_encryption
    - lateral_movement:
        method: build_server_compromise
mitigations:
  - dependency_scanning
  - binary_authorization
  - software_bill_of_materials
  - integrity_verification
  - private_package_repositories
`,

  quantumBreach: `name: Quantum Breach
type: data_exfiltration
description: Sophisticated data exfiltration attack using stealth techniques and encrypted channels
severity: high
tags:
  - data_exfiltration
  - stealth
  - advanced_persistent_threat
parameters:
  target_data: intellectual_property
  exfiltration_volume_gb: 25
  stealth_level: maximum
  attack_chain:
    - initial_access:
        method: watering_hole
        compromised_sites: ["industry-specific-forum.com"]
    - persistence:
        method: modified_authentication_package
        location: security_subsystem
    - privilege_escalation:
        method: token_manipulation
        technique: token_duplication
    - collection:
        method: automated_collection
        data_types: ["design_files", "source_code", "research_documents"]
    - exfiltration:
        method: steganography
        carriers: ["image_files", "video_streams"]
        scheduling: small_chunks_during_business_hours
mitigations:
  - data_loss_prevention
  - egress_filtering
  - behavioral_analytics
  - encrypted_storage
  - data_classification
`
};