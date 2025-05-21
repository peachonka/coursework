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
            IQueryable<Income> query = _context.Incomes;

            if (!string.IsNullOrEmpty(memberId))
                query = query.Where(i => i.FamilyMemberId == memberId);

            if (startDate.HasValue)
                query = query.Where(i => i.Date >= startDate);

            if (endDate.HasValue)
                query = query.Where(i => i.Date <= endDate);

            return await query.ToListAsync();
        }

        // POST: api/incomes
        [HttpPost]
        public async Task<ActionResult<Income>> PostIncome(Income income)
        {
            income.Id = Guid.NewGuid().ToString();
            income.Date = DateTime.UtcNow;

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIncomes), new { id = income.Id }, income);
        }
    }
}