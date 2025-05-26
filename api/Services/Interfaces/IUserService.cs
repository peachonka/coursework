using BudgetApi.Models;
using System.Threading.Tasks;

namespace BudgetApi.Services
{
    public interface IUserService
    {
        Task<User?> GetUserById(string userId);
        Task<User?> GetUserByEmail(string email);
    }
}