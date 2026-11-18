package com.techspeak.reminders

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

/** TurboModule behind src/services/reminders/native/NativeDailyReminder.ts. */
class DailyReminderModule(context: ReactApplicationContext) : NativeDailyReminderSpec(context) {
  override fun scheduleDaily(hour: Double, minute: Double, title: String, body: String, promise: Promise) {
    try {
      val reminder = ReminderScheduler.Reminder(hour.toInt(), minute.toInt(), title, body)
      ReminderScheduler.save(reactApplicationContext, reminder)
      ReminderScheduler.armNext(reactApplicationContext, reminder)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_REMINDER", e.message, e)
    }
  }

  override fun cancel(promise: Promise) {
    ReminderScheduler.cancel(reactApplicationContext)
    promise.resolve(null)
  }

  companion object {
    const val NAME = NativeDailyReminderSpec.NAME
  }
}
