// Services/UserService.cs
using BudgetApi.Data;
using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserById(string userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}