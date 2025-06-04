using BudgetApi.Models;
using BudgetApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

        // GET: api/accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyAccountDto>>> GetFamilyAccounts([FromQuery] string familyId)
        {
            try
            {
                var accounts = await _context.Accounts
                    .Where(a => a.FamilyId == familyId)
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

        [HttpPatch]
        public async Task<IActionResult> UpdateAccountBalance(
            [FromQuery] string familyId,
            [FromQuery] string accountType,
            [FromBody] UpdateBalanceRequest request
        )
        {
            Console.WriteLine(familyId);
            Console.WriteLine(accountType);
            try
            {
                AccountType type = AccountType.Main;
                switch (accountType)
                {
                    case "текущий капитал":
                        type = AccountType.Main;
                        break;
                    case "резервный капитал":
                        type = AccountType.Savings;
                        break;
                    case "инвестиционный капитал":
                        type = AccountType.Investment;
                        break;
                    default:
                        return BadRequest("Неверный тип счета");
                }
                var account = await _context.Accounts
                    .Where(a => a.FamilyId == familyId && a.AccountType == type)
                    .FirstOrDefaultAsync();

                if (account == null)
                    return BadRequest("Не удалось найти счет для обновления");

                account.Balance = request.Balance;
                await _context.SaveChangesAsync();

                return Ok();
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

    public class UpdateBalanceRequest
{
    public decimal Balance { get; set; }
}
}