export class PostValidator {
  public static validatePostPayload(data: any): string[] {
    const errors: string[] = [];

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Article title must be at least 3 characters long');
    }

    if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 10) {
      errors.push('Article content must be at least 10 characters long');
    }

    const validStatuses = [
      'draft',
      'pending_review',
      'changes_requested',
      'rejected',
      'published',
      'scheduled',
      'archived',
    ];
    if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    if (data.status === 'scheduled' && !data.scheduledAt) {
      errors.push('Scheduled publishing requires a valid scheduled date/time');
    }

    return errors;
  }
}

