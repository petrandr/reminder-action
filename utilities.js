const regex = /\r?\n\r?\n<!-- bot: (?<reminder>{"reminders":.*) -->/;

function getRemindersFromBody(body) {
  if (body === null) return [];

  const match = body.match(regex);

  return match ? JSON.parse(match.groups.reminder).reminders : [];
}

function getPastDueReminders(now, items) {
  return items.filter((item) => {
    try {
      const dueDate = Date.parse(item.reminder.when);
      core.info(dueDate);
      return dueDate < now;
    } catch (error) {
      console.error('error parsing date', error);
    }

    return false;
  });
}

function createCommentsMetadata(items) {
  return items.map((item) => {
    const body = `:wave: @${item.reminder.who}, ${item.reminder.what}`;
    core.info(body);
    core.info(item.issueNumber);
    return {
      issue_number: item.issueNumber,
      body: body,
    };
  });
}

function markAsNotified(body, reminderId) {
  const reminders = getRemindersFromBody(body);
  const activeReminders = reminders.filter(
    (reminder) => reminder.id !== reminderId
  );

  if (activeReminders.length === 0) {
    return { body: body.replace(regex, ''), hasActive: false };
  }

  return {
    body: body.replace(
      regex,
      `\n\n<!-- bot: ${JSON.stringify({ reminders: activeReminders })} -->`
    ),
    hasActive: true,
  };
}

module.exports = {
  getRemindersFromBody,
  getPastDueReminders,
  createCommentsMetadata,
  markAsNotified,
};
