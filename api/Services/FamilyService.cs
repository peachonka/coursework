using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BudgetApi.Services
{
    public class FamilyService : IFamilyService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;

        public FamilyService(AppDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        public async Task<Family> CreateFamily(
            string creatorId,
            string name,
            string relationshipType,
            List<string> incomeTypes)
        {
            var existingFamily = await _context.Families
                .FirstOrDefaultAsync(f => f.CreatorId == creatorId);
            if (existingFamily != null)
                throw new Exception("User already has a family");
            var user = await _userService.GetUserById(creatorId);
            if (user == null)
                throw new Exception("User not found");

            var family = new Family
            {
                Id = Guid.NewGuid().ToString(),
                CreatorId = creatorId,
                User = user
                
            };

            var accSave = new Account
                {
                    Id = Guid.NewGuid().ToString(),
                    FamilyId = family.Id,
                    AccountType = AccountType.Main,
                    Balance = 0
                };

                var invSave = new Account
                {
                    Id = Guid.NewGuid().ToString(),
                    FamilyId = family.Id,
                    AccountType = AccountType.Savings,
                    Balance = 0
                };

                var stash = new Account
                {
                    Id = Guid.NewGuid().ToString(),
                    FamilyId = family.Id,
                    AccountType = AccountType.Investment,
                    Balance = 0
                };

            // Создаем запись члена семьи (создатель)
            var creatorMember = new FamilyMember
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                RelationshipType = relationshipType,
                IncomeTypes = incomeTypes,
                UserId = creatorId,
                User = user,
                FamilyId = family.Id,
                Role = "admin" // Автоматически назначаем роль админа
            };

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.Families.AddAsync(family);
                await _context.SaveChangesAsync();

                await _context.FamilyMembers.AddAsync(creatorMember);
                await _context.SaveChangesAsync();

                await _context.Accounts.AddAsync(accSave);
                await _context.Accounts.AddAsync(invSave);
                await _context.Accounts.AddAsync(stash);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return family;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}