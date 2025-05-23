using BudgetApi.Models;

namespace BudgetApi.Services
{
    public interface IAuthService
    {
        Task<User> Register(RegisterDto registerDto);
        Task<string> Login(LoginDto loginDto);
        Task<bool> AssignAdminRole(string currentUserId, string targetUserId);
    }
}