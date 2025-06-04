namespace BudgetApi.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(ILogger<NotificationService> logger)
        {
            _logger = logger;
        }

        public async Task SendJoinRequestAsync(string fromEmail, string toEmail, string message)
        {
            _logger.LogInformation(
                "Отправка запроса на присоединение: от {FromEmail} к {ToEmail}. Сообщение: {Message}",
                fromEmail, toEmail, message);
            
            await Task.CompletedTask;
        }
    }
}