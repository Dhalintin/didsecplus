export interface NotificationSettingDto {
  userId: string;

  platformUpdates?: boolean;

  jobExpiry?: boolean;
  jobReviewOrFlag?: boolean;

  interviewScheduleUpdate?: boolean;

  recruiterResponse?: boolean;
  recruiterViewedAssessment?: boolean;
}
