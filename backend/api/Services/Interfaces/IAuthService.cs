using BudgetApi.Models;

namespace BudgetApi.Services
{
    public interface IAuthService
    {
        Task<User> Register(RegisterDto registerDto);
        Task<string> Login(LoginDto loginDto);
    }
}