// FamilyService.cs
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
            string relationshipType,
            List<string> incomeTypes)
        {
            var existingFamily = await _context.Families
                .FirstOrDefaultAsync(f => f.CreatorId == creatorId);
            if (existingFamily != null)
                throw new Exception("User already has a family");
            // Получаем данные пользователя
            var user = await _userService.GetUserById(creatorId);
            if (user == null)
                throw new Exception("User not found");

            // Создаем семью
            var family = new Family
            {
                Id = Guid.NewGuid().ToString(),
                CreatorId = creatorId,
                User = user
            };

            // Создаем запись члена семьи (создатель)
            var creatorMember = new FamilyMember
            {
                Id = Guid.NewGuid().ToString(),
                Name = user.Name,
                RelationshipType = relationshipType,
                IncomeTypes = incomeTypes,
                UserId = creatorId,
                User = user,
                FamilyId = family.Id,
                Family = family,
                Role = "admin" // Автоматически назначаем роль админа
            };

            // Начинаем транзакцию
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Сохраняем семью
                await _context.Families.AddAsync(family);
                await _context.SaveChangesAsync();

                // Сохраняем члена семьи
                await _context.FamilyMembers.AddAsync(creatorMember);
                await _context.SaveChangesAsync();

                // Фиксируем транзакцию
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