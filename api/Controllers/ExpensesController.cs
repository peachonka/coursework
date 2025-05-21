// Controllers/ExpensesController.cs
using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpensesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(
            [FromQuery] string? memberId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] bool? plannedOnly = null)
        {
            IQueryable<Expense> query = _context.Expenses;

            if (!string.IsNullOrEmpty(memberId))
                query = query.Where(e => e.FamilyMemberId == memberId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate);

            if (plannedOnly.HasValue)
                query = query.Where(e => e.IsPlanned == plannedOnly);

            return await query.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(Expense expense)
        {
            expense.Id = Guid.NewGuid().ToString();
            expense.Date = expense.Date == default ? DateTime.UtcNow : expense.Date;

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpenses), new { id = expense.Id }, expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(string id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}