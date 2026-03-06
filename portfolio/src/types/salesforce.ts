export interface SFProject {
  Id: string;
  Name: string;
  Summary_Details__c: string | null;
  Tech_Stack__c: string | null;
  Demo_URL__c: string | null;
  Repo_URL__c: string | null;
  Work_Experience__c: string | null;
}

export interface SFSkill {
  Id: string;
  Name: string;
  Level__c: string | null;
  Percent__c: number | null;
  Points__c: number | null;
  Portfolio__c: string | null;
  Tags__c: string | null;
}

export interface SFWorkExperience {
  Id: string;
  Name: string;
  Company__c: string | null;
  Role__c: string | null;
  Start_Date__c: string | null;
  End_Date__c: string | null;
  Is_Current__c: boolean;
  Description__c: string | null;
  Projects__r: { records: SFProject[] } | null;
}

// Legacy alias
export type SFPortfolio = SFProject;
