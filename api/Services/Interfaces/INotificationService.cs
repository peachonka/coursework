namespace BudgetApi.Services
{
    public interface INotificationService
    {
        Task SendJoinRequestAsync(string fromEmail, string toEmail, string message);
    }
}