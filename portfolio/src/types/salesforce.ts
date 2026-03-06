export interface SFPortfolio {
  Id: string;
  Name: string;
  Phone__c: string | null;
  Email__c: string | null;
  Profile_Summary__c: string | null;
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
}
