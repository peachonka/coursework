using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                IQueryable<Income> query = _context.Incomes;

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
                AccountType = incomeDto.AccountType,
                FamilyMemberId = incomeDto.FamilyMemberId,
                Date = incomeDto.Date
            };

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIncomes), new { id = income.Id }, income);
        }
    }
}

public class IncomeCreateDto
{
    public decimal Amount { get; set; }
    public required string AccountType { get; set; }
    public required string Type { get; set; }
    public required string FamilyMemberId { get; set; }
    public DateTime Date { get; set; }
}