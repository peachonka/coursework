using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/accounts/family
        [HttpGet("family")]
        public async Task<ActionResult<IEnumerable<FamilyAccountDto>>> GetFamilyAccounts()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                
                // Находим члена семьи текущего пользователя
                var familyMember = await _context.FamilyMembers
                    .Include(fm => fm.Family)
                    .FirstOrDefaultAsync(fm => fm.UserId == userId);
                
                if (familyMember == null || familyMember.Family == null)
                {
                    return NotFound("Family not found");
                }

                // Получаем все счета семьи
                var accounts = await _context.Accounts
                    .Where(a => a.FamilyId == familyMember.Family.Id)
                    .Select(a => new FamilyAccountDto
                    {
                        Id = a.Id,
                        FamilyId = a.FamilyId,
                        AccountType = a.AccountType,
                        Balance = a.Balance,
                    })
                    .ToListAsync();

                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class FamilyAccountDto
    {
        public required string Id { get; set; }
        public required string FamilyId { get; set; }
        public AccountType AccountType { get; set; }
        public decimal Balance { get; set; }
    }
}