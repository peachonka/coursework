using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Numerics;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncomesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IncomesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/incomes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Income>>> GetIncomes(
            [FromQuery] string? memberId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                IQueryable<Income> query = _context.Incomes
                    .Include(i => i.FamilyMember);
                    
                if (!string.IsNullOrEmpty(memberId))
                    query = query.Where(i => i.FamilyMemberId == memberId);

                if (startDate.HasValue)
                    query = query.Where(i => i.Date >= startDate.Value.ToUniversalTime());

                if (endDate.HasValue)
                    query = query.Where(i => i.Date <= endDate.Value.ToUniversalTime());

                var result = await query.ToListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/incomes
        [HttpPost]
        public async Task<ActionResult<Income>> PostIncome(
            [FromBody] IncomeCreateDto incomeDto)
        {
            var income = new Income
            {
                Id = Guid.NewGuid().ToString(),
                Amount = incomeDto.Amount,
                Type = incomeDto.Type,
                FamilyMemberId = incomeDto.FamilyMemberId,
                Date = incomeDto.Date
            };

            // 2. Находим соответствующий счет
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountType == 0);

            // Обновляем баланс существующего счета
            if (account != null) account.Balance += incomeDto.Amount;

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();            

            return CreatedAtAction(nameof(GetIncomes), new { id = income.Id }, income);
        }
    }
}

public class IncomeCreateDto
{
    public decimal Amount { get; set; }
    public required string Type { get; set; }
    public required string FamilyMemberId { get; set; }
    public DateTime Date { get; set; }
}

public class IncomeResponseDto
    {
        public string Id { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!;
        public DateTime Date { get; set; }
        public FamilyMember? FamilyMember { get; set; }
    }